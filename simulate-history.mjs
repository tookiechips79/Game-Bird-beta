// GameBird V2 — Game History & Bet Ledger integrity simulation
// Mirrors exact GameContext.declareWinner + recording logic, 100 games, 5 users

const STARTING_CREDITS = 1000;
const NUM_GAMES = 100;
const BET_AMOUNTS = [10, 20, 50, 100];

// ── Users ─────────────────────────────────────────────────────────────────────
const users = ['Alice', 'Bob', 'Carlos', 'Diana', 'Erik'].map((name, i) => ({
  id: `u${i}`, name,
  credits: STARTING_CREDITS,
  pendingBets: [],
}));

const getUserById = (id) => users.find(u => u.id === id);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
let betIdCounter = 0;

// ── Match bets (mirrors GameContext matchBets) ────────────────────────────────
function matchBets(queueA, queueB) {
  const booked = [];
  const usedA = new Set(), usedB = new Set();
  for (const ba of queueA) {
    if (usedA.has(ba.id)) continue;
    const match = queueB.find(bb => !usedB.has(bb.id) && bb.amount === ba.amount);
    if (match) {
      usedA.add(ba.id); usedB.add(match.id);
      ba.booked = true; match.booked = true;
      booked.push({
        id: `booked_${++betIdCounter}`,
        betIdA: ba.id, betIdB: match.id,
        userIdA: ba.userId, userIdB: match.userId,
        userNameA: ba.userName, userNameB: match.userName,
        amount: ba.amount,
      });
    }
  }
  return booked;
}

// ── Simulation state ──────────────────────────────────────────────────────────
const gameHistory = [];
const issues = [];
let gameNumber = 1;

// ── Run 100 games ─────────────────────────────────────────────────────────────
for (let g = 0; g < NUM_GAMES; g++, gameNumber++) {
  const teamAQueue = [];
  const teamBQueue = [];

  // Place bets (70% chance each user, random side + amount)
  for (const user of users) {
    if (Math.random() < 0.70) {
      const amount = rand(BET_AMOUNTS);
      if (user.credits < amount) continue;
      const side = Math.random() < 0.5 ? 'A' : 'B';
      const betId = `bet_${++betIdCounter}`;
      user.credits -= amount;
      user.pendingBets.push({ id: betId, amount, gameNumber, teamSide: side });
      const bet = { id: betId, userId: user.id, userName: user.name, amount, teamSide: side, gameNumber, booked: false };
      if (side === 'A') teamAQueue.push(bet); else teamBQueue.push(bet);
    }
  }

  const bookedBets = matchBets(teamAQueue, teamBQueue);
  const winner = Math.random() < 0.5 ? 'A' : 'B';

  // ── Mirror declareWinner balance snapshot logic ────────────────────────────
  const allBets = [...teamAQueue, ...teamBQueue];
  const betSumByUser = {};
  allBets.forEach(b => { betSumByUser[b.userId] = (betSumByUser[b.userId] || 0) + b.amount; });
  const preBalances = {};
  Object.keys(betSumByUser).forEach(id => {
    const u = getUserById(id);
    if (u) preBalances[id] = u.credits + betSumByUser[id]; // restore deducted amount to get pre-bet balance
  });
  const runningDed = {};
  const balanceBefore = (userId, amt) => {
    const prior = runningDed[userId] || 0;
    const bal = (preBalances[userId] ?? 0) - prior;
    runningDed[userId] = prior + amt;
    return bal;
  };

  // Build GameBet records (only matched bets go into ledger)
  const makeGameBets = (queue) =>
    queue.filter(b => b.booked).map(b => ({
      userId: b.userId,
      userName: b.userName,
      amount: b.amount,
      won: (winner === 'A' && b.teamSide === 'A') || (winner === 'B' && b.teamSide === 'B'),
      booked: true,
      startingBalance: balanceBefore(b.userId, b.amount),
    }));

  const gameBetsA = makeGameBets(teamAQueue);
  const gameBetsB = makeGameBets(teamBQueue);
  const totalAmount = bookedBets.reduce((s, b) => s + b.amount, 0);

  const record = {
    id: `game_${gameNumber}`,
    gameNumber,
    timestamp: Date.now(),
    teamAName: 'Player A',
    teamBName: 'Player B',
    winningTeam: winner,
    bets: { teamA: gameBetsA, teamB: gameBetsB },
    totalAmount,
    duration: Math.floor(Math.random() * 600),
  };

  gameHistory.push(record);

  // ── Pay out / refund (mirrors clearPendingBetsForGame + refundBet) ─────────
  for (const bb of bookedBets) {
    const winnerId = winner === 'A' ? bb.userIdA : bb.userIdB;
    const loserId  = winner === 'A' ? bb.userIdB : bb.userIdA;
    getUserById(winnerId).credits += bb.amount * 2;
    // Remove pending bets for both
    const winBetId = winner === 'A' ? bb.betIdA : bb.betIdB;
    const loseBetId = winner === 'A' ? bb.betIdB : bb.betIdA;
    getUserById(winnerId).pendingBets = getUserById(winnerId).pendingBets.filter(p => p.id !== winBetId);
    getUserById(loserId).pendingBets  = getUserById(loserId).pendingBets.filter(p => p.id !== loseBetId);
  }
  // Refund unmatched
  for (const bet of allBets) {
    if (!bet.booked) {
      const u = getUserById(bet.userId);
      u.credits += bet.amount;
      u.pendingBets = u.pendingBets.filter(p => p.id !== bet.id);
    }
  }

  // ── Verify this record ─────────────────────────────────────────────────────
  const checkIssues = [];

  // 1. Record has required fields
  if (!record.id)          checkIssues.push('missing id');
  if (!record.gameNumber)  checkIssues.push('missing gameNumber');
  if (!record.timestamp)   checkIssues.push('missing timestamp');
  if (!record.winningTeam) checkIssues.push('missing winningTeam');
  if (record.totalAmount === undefined) checkIssues.push('missing totalAmount');

  // 2. All bets in ledger are marked booked
  const unbookedInLedger = [...gameBetsA, ...gameBetsB].filter(b => !b.booked);
  if (unbookedInLedger.length > 0) checkIssues.push(`${unbookedInLedger.length} unbooked bets in ledger`);

  // 3. Won/lost flags are correct
  for (const bet of gameBetsA) {
    if (bet.won !== (winner === 'A')) checkIssues.push(`Team A bet won flag wrong for ${bet.userName}`);
  }
  for (const bet of gameBetsB) {
    if (bet.won !== (winner === 'B')) checkIssues.push(`Team B bet won flag wrong for ${bet.userName}`);
  }

  // 4. totalAmount = sum of all matched bet amounts (one side)
  const expectedTotal = bookedBets.reduce((s, b) => s + b.amount, 0);
  if (record.totalAmount !== expectedTotal) checkIssues.push(`totalAmount mismatch: got ${record.totalAmount}, expected ${expectedTotal}`);

  // 5. Each matched pair appears exactly once in ledger (A side + B side)
  if (gameBetsA.length !== bookedBets.length) checkIssues.push(`ledger A count ${gameBetsA.length} != matched pairs ${bookedBets.length}`);
  if (gameBetsB.length !== bookedBets.length) checkIssues.push(`ledger B count ${gameBetsB.length} != matched pairs ${bookedBets.length}`);

  // 6. startingBalance is non-negative
  for (const bet of [...gameBetsA, ...gameBetsB]) {
    if ((bet.startingBalance ?? 0) < 0) checkIssues.push(`negative startingBalance for ${bet.userName}`);
  }

  // 7. Duplicate game numbers in history
  const seen = new Set();
  for (const r of gameHistory) {
    if (seen.has(r.gameNumber)) checkIssues.push(`duplicate gameNumber ${r.gameNumber} in history`);
    seen.add(r.gameNumber);
  }

  if (checkIssues.length > 0) {
    issues.push({ game: gameNumber, issues: checkIssues });
  }
}

// ── Final credit drift check ───────────────────────────────────────────────────
const finalTotal = users.reduce((s, u) => s + u.credits, 0);
const drift = finalTotal - STARTING_CREDITS * users.length;
const pendingStuck = users.filter(u => u.pendingBets.length > 0);

// ── Report ─────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('  GameBird V2 — History & Bet Ledger Integrity Check');
console.log('══════════════════════════════════════════════════════\n');

console.log(`Games simulated  : ${NUM_GAMES}`);
console.log(`History entries  : ${gameHistory.length}`);

const totalBooked = gameHistory.reduce((s, r) => s + r.bets.teamA.length + r.bets.teamB.length, 0);
const totalITM    = gameHistory.reduce((s, r) => s + r.totalAmount * 2, 0);
console.log(`Total ledger bets: ${totalBooked} (${totalBooked / 2} matched pairs)`);
console.log(`Total ITM coins  : ${totalITM.toLocaleString()}`);
console.log('');

// Game history completeness
const missingGames = [];
for (let n = 1; n <= NUM_GAMES; n++) {
  if (!gameHistory.find(r => r.gameNumber === n)) missingGames.push(n);
}
if (missingGames.length === 0) {
  console.log('✅  Game history: all 100 games recorded, no gaps, no duplicates.');
} else {
  console.log(`❌  Missing games in history: ${missingGames.join(', ')}`);
}

// Ledger integrity
if (issues.length === 0) {
  console.log('✅  Bet ledger: all records pass integrity checks.');
} else {
  console.log(`❌  Bet ledger issues found in ${issues.length} game(s):`);
  for (const { game, issues: iss } of issues) {
    console.log(`  Game ${game}: ${iss.join(' | ')}`);
  }
}

// Credit drift
if (drift === 0) {
  console.log('✅  Credit integrity: zero drift — coins in = coins out.');
} else {
  console.log(`❌  Credit drift detected: ${drift > 0 ? '+' : ''}${drift} coins`);
}

// Stuck pending bets
if (pendingStuck.length === 0) {
  console.log('✅  Pending bets: all cleared after 100 games.');
} else {
  console.log(`❌  Stuck pending bets after simulation:`);
  for (const u of pendingStuck) {
    console.log(`  ${u.name}: ${u.pendingBets.length} pending bet(s) totaling ${u.pendingBets.reduce((s, b) => s + b.amount, 0)} coins`);
  }
}

// Won/lost symmetry across ledger
let totalWonInLedger = 0, totalLostInLedger = 0;
for (const r of gameHistory) {
  for (const b of [...r.bets.teamA, ...r.bets.teamB]) {
    if (b.won) totalWonInLedger += b.amount;
    else totalLostInLedger += b.amount;
  }
}
console.log('');
console.log('── Ledger Win/Loss Symmetry ──────────────────────────');
console.log(`  Total won  in ledger: ${totalWonInLedger}`);
console.log(`  Total lost in ledger: ${totalLostInLedger}`);
if (totalWonInLedger === totalLostInLedger) {
  console.log('  ✅  Perfectly symmetric — every win has a matching loss.');
} else {
  console.log(`  ❌  Asymmetry: ${Math.abs(totalWonInLedger - totalLostInLedger)} coin difference`);
}

console.log('');
console.log('── Sample Records (first 3 games with bets) ──────────');
let shown = 0;
for (const r of gameHistory) {
  if (r.bets.teamA.length === 0 && r.bets.teamB.length === 0) continue;
  if (shown++ >= 3) break;
  console.log(`  Game #${r.gameNumber} → ${r.winningTeam === 'A' ? 'Player A' : 'Player B'} wins | ITM: ${r.totalAmount * 2} | bets: A[${r.bets.teamA.map(b => `${b.userName}:${b.amount}${b.won?'✓':'✗'}`).join(',')}] B[${r.bets.teamB.map(b => `${b.userName}:${b.amount}${b.won?'✓':'✗'}`).join(',')}]`);
}

console.log(`\n✅  Simulation complete.\n`);
