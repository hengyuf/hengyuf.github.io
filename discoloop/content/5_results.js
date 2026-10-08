// Part "results": second half of chapter 05 (does DiscoLoop work?), chapter 06 (takeaways and open questions), outro.
// Sources: paper §5.1-5.3, §6, App. A.2, A.3, B (Fig. 3, 4, 7, Table 2); exp_data.json; the talk (42:42-49:44).
(window.BLOG_PARTS = window.BLOG_PARTS || {})["results"] = [

  // ------------------------------------------------------------------ 07
  { type: "scrolly", scene: "Part6A_Symbolic", groups: [
      { steps: [0, 1],
        big: "DiscoLoop gets near-perfect accuracy, <em>OOD included</em>.",
        small: "Symbolic task, same setup as before (K = 2, 3,000 epochs; fixed gate α⋆ = 1, τ = 1). Final ID / OOD (%): " +
               "DiscoLoop 99.8 / 98.8, vanilla loop 71.1 / 8.3, no loop 16.9 / 0.8 despite twice the parameters." },
      { steps: [2, 4],
        big: "If one loop alone can answer, the answer was memorized.",
        small: "To see how it learns, track <b>stage-1 accuracy</b> from earlier (one loop only, K = 1) on two-hop " +
               "<i>training</i> questions. A low score means the model needs loop 2, so it splits the question into hops." },
      { steps: [5, 5],
        big: "All models memorize first; looped ones then drop the shortcut.",
        small: "Stage-1 accuracy first hits ≈100%, then collapses for both looped models, deepest for DiscoLoop " +
               "(1.7% vs. 8.8% at epoch 3,000). Gray: the no-loop model’s final train accuracy (it has no stages)." },
      { steps: [6, 6],
        big: "Early on, DiscoLoop too just memorizes two-hop answers.",
        small: "In the shaded band (epochs 0–500), stage-1 accuracy is near 100%: one loop alone answers the " +
               "training questions. The other models are dimmed." },
      { steps: [7, 8],
        big: "Then it <em>decomposes into hops</em>, and test accuracy jumps.",
        small: "Once one loop can no longer answer, the model must hand the second hop to loop 2. Around epoch 500, " +
               "ID and OOD both pass 80%. Looping favors this switch; Φ’s cleaner signal makes it earlier and sharper." }
  ] },

  { type: "scrolly", scene: "Part6B_Language", groups: [
      { steps: [0, 0],
        big: "Now the same task, written in English.",
        small: "Is the gain just an artifact of symbolic tokens? Each entity token becomes a person’s name and each " +
               "relation token a relation word. The two-graph design and the ID / OOD splits stay the same." },
      { steps: [1, 1],
        big: "Each fact becomes a sentence: “Finley’s teacher is Anya.”",
        small: "Facts and two-hop questions are still separate training examples, so the bridge (Anya) never " +
               "appears inside a question." },
      { steps: [2, 4],
        big: "Two question formats: relations named in order, or backwards.",
        small: "Direct: “Finley’s teacher’s wife is Charlie.” Reverse: “Who is the wife of the teacher of Finley? " +
               "Answer: Charlie.” Same facts and answers; in reverse, the model must compose the relations in the " +
               "opposite order to how they appear." },
      { steps: [5, 5],
        big: "In English too, only DiscoLoop generalizes OOD.",
        small: "K = 2, 5,000 epochs, learnable gate. DiscoLoop: ≈100% ID and ≈95% OOD in both formats, near-perfect ID " +
               "by about epoch 500. Vanilla loop: ≈90% ID, but ≈4% (direct) / ≈0% (reverse) OOD. No loop: ≈40% (direct) / ≈20% (reverse) ID, ≈0% OOD." }
  ] },

  { type: "scrolly", scene: "Part6C_Pretraining", groups: [
      { steps: [0, 0],
        big: "Last test: real language-model pretraining.",
        small: "440M parameters: a 24-layer f<sub>θ</sub> (d = 1024) applied 4 times, trained on 20B " +
               "tokens of FineWeb-Edu and FineMath (6:4). Vanilla loop vs. DiscoLoop: only the recurrence differs." },
      { steps: [1, 3],
        big: "The vanilla loop starts ahead; after ≈13B tokens, <em>DiscoLoop pulls ahead</em>.",
        small: "Training loss over the 20B tokens (global average, smoothed). In the zoom on late training, green " +
               "marks where DiscoLoop’s loss is lower; at its largest the gap is on the order of 10<sup>−2</sup>." },
      { steps: [4, 4],
        big: "Better zero-shot scores: average <em>49.3 → 50.5</em>.",
        small: "Seven standard benchmarks. DiscoLoop is better on six and ties on HellaSwag; its largest gains over the vanilla loop are " +
               "LAMBADA (+2.5), ARC-C (+2.1) and SciQ (+2.0). The only extra compute is decode-then-encode, kept " +
               "cheap by using just the 128 most likely tokens." }
  ] },

  // ------------------------------------------------------------------ 08
  { type: "chapter", id: "takeaways", num: "06", title: "Takeaways and open questions" },

  { type: "takeaways", items: [
      { big: "Looping fixes the storage problem, but leaves a <em>representation bottleneck</em>." },
      { big: "DiscoLoop loops both the <em>discrete embedding</em> and the continuous hidden state." }
  ] },

  { type: "statement", big: "Two questions are still open." },

  { type: "scrolly", scene: "Part7A_LengthGen", groups: [
      { steps: [0, 1],
        big: "Open question 1: can DiscoLoop handle longer chains?",
        small: "Length generalization: train on questions with up to two hops, then test on longer ones. It would show " +
               "whether DiscoLoop learns a general way to compose facts, not a trick tied to a fixed depth." },
      { steps: [2, 3],
        big: "Train only on one-hop and two-hop questions.",
        small: "“Alice son → Bob” and “Alice son wife → Carol”. Training always uses K = 2 loops, enough for " +
               "two hops." },
      { steps: [4, 6],
        big: "Test on three hops, and <em>add one loop</em>.",
        small: "“Alice son wife boss → ?” Two loops cover two hops, so a third loop is added only at test time " +
               "(K = 3). Whether it answers correctly is exactly what we don’t know yet." },
      { steps: [7, 7],
        big: "If it works, harder questions simply get more loops.",
        small: "The loop count would become a test-time knob. Related evidence in the paper (App. A.2): with three-hop questions " +
               "<i>in</i> training and K = 3, DiscoLoop reaches ≈65% three-hop OOD; both baselines stay near zero." }
  ] },

  { type: "scrolly", scene: "Part7B_ScalableLoops", groups: [
      { steps: [0, 2],
        big: "Open question 2: how far can looping scale?",
        small: "Each loop reuses the same f<sub>θ</sub>, so more loops (K = 1, 2, 4, 8) add compute without adding parameters. " +
               "Our pretraining runs used K = 4." },
      { steps: [3, 4],
        big: "Many loops mean a very deep network to train.",
        small: "Training backpropagates through every loop. A 24-layer f<sub>θ</sub> looped 8 times is 192 layers " +
               "deep, where gradients can fade or blow up. How to train many loops well is still open." }
  ] },
];
