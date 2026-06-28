// GameBird V2 — 100-game simulation, 5 users, random bets
// Mirrors the exact credit/bet/payout logic from GameContext + UserContext

const STARTING_CREDITS = 1000;
const NUM_GAMES = 100;
const BET_AMOUNTS = [10, 20, 50, 100];

// ── Users ────────────────────────────────────────────────────────────────────
const users = ['Alice', 'Bob', 'Carlos', 'Diana', 'Erik'].map((name, i) => ({
  id: `u${i}`,
  name,
  credits: STARTING_CREDITS,
  pendingBets: [],
  tipsReceived: 0,
  tipsGiven: 0,
  totalWon: 0,
  totalLost: 0,
  betsPlaced: 0,
  betsMatched: 0,
}));

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getUserById = (id) => users.find(u => u.id === id);

// ── Match bets (smallest-first, equal amounts) ────────────────────────────────
function matchBets(queueA, queueB) {
  const booked = [];
  const usedA = new Set();
  const usedB = new Set();
  for (const ba of queueA) {
    if (usedA.has(ba.id)) continue;
    const match = queueB.find(bb => !usedB.has(bb.id) && bb.amount === ba.amount);
    if (match) {
      usedA.add(ba.id);
      usedB.add(match.id);
      ba.booked = true;
      match.booked = true;
      booked.push({ betIdA: ba.id, betIdB: match.id, userIdA: ba.userId, userIdB: match.userId, amount: ba.amount });
    }
  }
  return booked;
}

// ── Stats tracking ────────────────────────────────────────────────────────────
let totalCoinsInCirculation = users.reduce((s, u) => s + u.credits, 0);
let betIdCounter = 0;
const gameLog = [];

// ── Simulation ────────────────────────────────────────────────────────────────
for (let game = 1; game <= NUM_GAMES; game++) {
  const teamAQueue = [];
  const teamBQueue = [];

  // Each user randomly decides to bet (70% chance), picks side and amount
  for (const user of users) {
    if (Math.random() < 0.70) {
      const amount = rand(BET_AMOUNTS);
      if (user.credits < amount) continue;

      const side = Math.random() < 0.5 ? 'A' : 'B';
      const betId = `b${++betIdCounter}`;
      const bet = { id: betId, userId: user.id, amount, side, booked: false };

      // Deduct immediately (pending)
      user.credits -= amount;
      user.pendingBets.push({ id: betId, amount });
      user.betsPlaced++;

      if (side === 'A') teamAQueue.push(bet);
      else teamBQueue.push(bet);
    }
  }

  // Match bets
  const bookedBets = matchBets(teamAQueue, teamBQueue);

  // Declare winner (50/50)
  const winner = Math.random() < 0.5 ? 'A' : 'B';

  let gameCoinsIn = 0;
  let gameCoinsOut = 0;
  let matchedCount = 0;

  // Pay out matched bets
  for (const bb of bookedBets) {
    const winnerId = winner === 'A' ? bb.userIdA : bb.userIdB;
    const loserId  = winner === 'A' ? bb.userIdB : bb.userIdA;
    const winUser  = getUserById(winnerId);
    const loseUser = getUserById(loserId);

    winUser.credits += bb.amount * 2;
    winUser.totalWon += bb.amount;
    winUser.betsMatched++;
    loseUser.totalLost += bb.amount;
    loseUser.betsMatched++;

    // Remove from pending
    winUser.pendingBets  = winUser.pendingBets.filter(p => p.id !== (winner === 'A' ? bb.betIdA : bb.betIdB));
    loseUser.pendingBets = loseUser.pendingBets.filter(p => p.id !== (winner === 'A' ? bb.betIdB : bb.betIdA));

    gameCoinsIn  += bb.amount * 2;
    gameCoinsOut += bb.amount * 2;
    matchedCount++;
  }

  // Refund unmatched bets
  const allBets = [...teamAQueue, ...teamBQueue];
  for (const bet of allBets) {
    if (!bet.booked) {
      const u = getUserById(bet.userId);
      u.credits += bet.amount;
      u.pendingBets = u.pendingBets.filter(p => p.id !== bet.id);
    }
  }

  const totalAfter = users.reduce((s, u) => s + u.credits, 0);
  const drift = totalAfter - totalCoinsInCirculation;

  gameLog.push({
    game,
    winner,
    betsPlaced: allBets.length,
    matched: matchedCount,
    unmatched: allBets.length - matchedCount * 2,
    drift,
    totalCoins: totalAfter,
  });
}

// ── Report ────────────────────────────────────────────────────────────────────
const totalFinal = users.reduce((s, u) => s + u.credits, 0);
const totalDrift = totalFinal - totalCoinsInCirculation;

console.log('\n══════════════════════════════════════════════');
console.log('  GameBird V2 — 100-Game Simulation Results');
console.log('══════════════════════════════════════════════\n');

console.log(`Starting coins in system : ${totalCoinsInCirculation.toLocaleString()}`);
console.log(`Ending coins in system   : ${totalFinal.toLocaleString()}`);
console.log(`Total drift (should = 0) : ${totalDrift >= 0 ? '+' : ''}${totalDrift}`);
console.log('');

console.log('── Per-User Results ──────────────────────────');
for (const u of users) {
  const net = u.credits - STARTING_CREDITS;
  const sign = net >= 0 ? '+' : '';
  console.log(
    `${u.name.padEnd(8)} | balance: ${String(u.credits).padStart(5)}  net: ${sign}${net}  ` +
    `bets: ${u.betsPlaced}  matched: ${u.betsMatched}  won: ${u.totalWon}  lost: ${u.totalLost}`
  );
}

console.log('');
console.log('── Game-by-Game Drift Check ──────────────────');
const driftGames = gameLog.filter(g => g.drift !== 0);
if (driftGames.length === 0) {
  console.log('✅  No drift detected in any game. Credit integrity PASSED.');
} else {
  console.log(`❌  Drift detected in ${driftGames.length} game(s):`);
  for (const g of driftGames) {
    console.log(`  Game ${g.game}: drift = ${g.drift}`);
  }
}

console.log('');
console.log('── Summary ───────────────────────────────────');
const totalBets = gameLog.reduce((s, g) => s + g.betsPlaced, 0);
const totalMatched = gameLog.reduce((s, g) => s + g.matched, 0);
const totalUnmatched = gameLog.reduce((s, g) => s + g.unmatched, 0);
console.log(`Total bets placed  : ${totalBets}`);
console.log(`Total bets matched : ${totalMatched * 2} (${totalMatched} pairs)`);
console.log(`Unmatched refunded : ${totalUnmatched}`);
console.log(`\n✅  Simulation complete — ${NUM_GAMES} games, 5 users.\n`);
