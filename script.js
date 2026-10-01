const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- sample data (swap for real contributor spots later) ---------- */
const pins = [
  { t: "Bayshore Boulevard", n: "Golden hour walk. Go after 6 and bring a friend.", by: "Maya, Hyde Park" },
  { t: "Ybor City", n: "Skip the main strip once. Wander the side streets instead.", by: "Jordan, Ybor" },
  { t: "Fort De Soto", n: "Catch sunset on the north beach. Pack snacks.", by: "Sam, St. Pete" },
  { t: "Tampa Riverwalk", n: "Rent bikes, follow the water, end at the Heights.", by: "Priya, Downtown" }
];

const spots = [
  { t: "Bayshore Boulevard", a: "South Tampa", n: "Longest continuous sidewalk views of the bay.", v: ["sunset", "outside"], c: "#FADF63" },
  { t: "Ybor City", a: "Historic district", n: "Cigar-era streets and late-night energy.", v: ["night", "food"], c: "#D0A5C0" },
  { t: "Fort De Soto", a: "Pinellas County", n: "Beaches, trails, and the best sunsets around.", v: ["sunset", "outside"], c: "#E77728" },
  { t: "Tampa Riverwalk", a: "Downtown", n: "Miles of waterfront for walking or biking.", v: ["outside", "night"], c: "#17B890" },
  { t: "Seminole Heights", a: "North Tampa", n: "Neighborhood spots where locals eat on a budget.", v: ["food"], c: "#FADF63" },
  { t: "Hyde Park Village", a: "South Tampa", n: "Slow morning coffee and a stroll after.", v: ["food", "outside"], c: "#D0A5C0" }
];

const options = [
  { t: "Sunset at Bayshore", c: "#FADF63" },
  { t: "Tacos in Seminole Heights", c: "#E77728" },
  { t: "Night out in Ybor", c: "#D0A5C0" }
];

/* ---------- map pins ---------- */
const note = $("#note");
function showPin(i) {
  const p = pins[i];
  $("#noteTitle").textContent = p.t;
  $("#noteText").textContent = p.n;
  $("#noteBy").textContent = "Local note from " + p.by;
  note.classList.remove("swap"); void note.offsetWidth; note.classList.add("swap");
  $$(".pin").forEach((el, k) => el.classList.toggle("on", k === i));
}
$$(".pin").forEach(el => el.addEventListener("click", () => showPin(+el.dataset.i)));
showPin(0);

/* ---------- discover grid + hearts ---------- */
let saved = new Set();
const grid = $("#grid");
function render(filter = "all") {
  grid.innerHTML = "";
  spots.filter(s => filter === "all" || s.v.includes(filter)).forEach((s, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.setProperty("--c", s.c);
    card.style.animationDelay = i * 60 + "ms";
    card.innerHTML = `<button class="heart ${saved.has(s.t) ? "on" : ""}" aria-label="Save ${s.t}">${saved.has(s.t) ? "♥" : "♡"}</button>
      <h3>${s.t}</h3><small>${s.a}</small><p>${s.n}</p>`;
    $(".heart", card).addEventListener("click", e => {
      const b = e.currentTarget;
      saved.has(s.t) ? saved.delete(s.t) : saved.add(s.t);
      b.classList.toggle("on"); b.textContent = saved.has(s.t) ? "♥" : "♡";
      const pill = $("#savedPill");
      pill.textContent = saved.size + " saved";
      pill.classList.add("bump"); setTimeout(() => pill.classList.remove("bump"), 300);
    });
    grid.appendChild(card);
  });
}
render();
$$(".chip").forEach(ch => ch.addEventListener("click", () => {
  $$(".chip").forEach(c => c.classList.remove("on"));
  ch.classList.add("on");
  render(ch.dataset.v);
}));

/* ---------- circle voting ---------- */
const votes = options.map(() => 0);
const vote = $("#vote");
options.forEach((o, i) => {
  const b = document.createElement("button");
  b.className = "opt"; b.style.setProperty("--c", o.c);
  b.innerHTML = `<i></i><span>${o.t}</span><span class="cnt">0</span>`;
  b.addEventListener("click", () => {
    votes[i]++;
    const total = votes.reduce((a, c) => a + c, 0);
    $$(".opt", vote).forEach((el, k) => {
      $("i", el).style.width = (votes[k] / total) * 100 + "%";
      $(".cnt", el).textContent = votes[k];
    });
    const top = Math.max(...votes);
    const leaders = options.filter((_, k) => votes[k] === top);
    $("#winner").textContent = leaders.length === 1 ? `${leaders[0].t} is winning.` : "It's a tie. Time to lobby your friends.";
  });
  vote.appendChild(b);
});

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .2 });
$$(".reveal").forEach(el => io.observe(el));

/* ---------- word-by-word scroll text ---------- */
const scrub = $("#scrub");
scrub.innerHTML = scrub.textContent.split(" ").map(w => `<span>${w}</span>`).join(" ");
const words = $$("span", scrub);

/* ---------- scroll-driven: scrub text + tern ---------- */
const tern = $("#tern");
let lastY = scrollY;
function onScroll() {
  const r = scrub.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .3)));
  words.forEach((w, i) => w.classList.toggle("lit", i / words.length < p));

  const max = document.documentElement.scrollHeight - innerHeight;
  const prog = max > 0 ? scrollY / max : 0;
  const tilt = Math.max(-18, Math.min(18, (scrollY - lastY) * .6));
  tern.style.transform = `translateY(${prog * (innerHeight * .6)}px) rotate(${tilt}deg)`;
  lastY = scrollY;
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- waitlist (demo only, wire to Tally/Typeform later) ---------- */
$("#joinBtn").addEventListener("click", () => {
  const v = $("#email").value.trim();
  $("#thanks").textContent = /\S+@\S+\.\S+/.test(v)
    ? "You're in. See you out there, neighbor."
    : "Add a valid email so we can reach you.";
});

$("#yr").textContent = new Date().getFullYear();
