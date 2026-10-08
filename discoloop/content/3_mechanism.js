// Part "mechanism": second half of chapter 04 (why vanilla looped Transformers fail): what goes wrong inside the loop
// (scenes Part4A_Stage1, Part4B_Bridge, Part4C_Mismatch, Part4D_Intervention; paper §3.2, Table 1, Eq. 3, Fig. 2)
(window.BLOG_PARTS = window.BLOG_PARTS || {})["mechanism"] = [
  { type: "scrolly", scene: "Part4A_Stage1", groups: [
      { steps: [0, 1],
        big: "The same block f<sub>θ</sub> runs twice on “Alice son wife ?”.",
        small: "The vanilla loop from above, after 3,000 epochs. Tokens enter as clean embeddings W[x]; " +
               "loop 1 gives hidden states H<sup>(1)</sup>, and loop 2 reruns the same weights on them." },
      { steps: [2, 3],
        big: "Read the last state through W, and out comes Carol.",
        small: "W, the embedding matrix reused as the output head, turns H<sup>(2)</sup><sub>3</sub> into logits z; " +
               "the top-scoring token (argmax) is the prediction. This is the normal prediction, after both loops." },
      { steps: [4, 6],
        big: "Stop after one loop, and the two-hop answer is not there yet.",
        small: "Stage-1 prediction: same weights, only loop 1 at test time (K = 1), same position. " +
               "If this already gave Carol, the model would be using a one-loop shortcut. Here it gives a wrong name (Eve, for illustration)." },
      { steps: [7, 9],
        big: "On a single fact, one loop already answers: Bob.",
        small: "The atomic fact “Alice son ?”, read at the “son” position after loop 1. " +
               "In the two-hop question, this same position is where the bridge should appear." },
      { steps: [10, 11],
        big: "After one loop: every fact, but almost no two-hop answers.",
        small: "Stage-1 accuracy: 100% on train_atom, but 8.8% on train_id, 0.9% on test_id and 0.0% on test_ood. " +
               "So there is no one-loop shortcut: the model has not memorized two-hop answers." },
      { steps: [12, 13],
        big: "Loop 2 does the composing, and storage is not the problem.",
        small: "Stage 2, the normal prediction: 100% on both training splits, 71.1% on test_id, only 8.3% on test_ood. " +
               "One loop recalls every atomic fact, and loop 2 does the composing; what fails is generalization." }
  ] },

  { type: "statement", big: "So where does it break?" },

  { type: "scrolly", scene: "Part4B_Bridge", groups: [
      { steps: [0, 2],
        big: "After loop 1, look where the bridge should be.",
        small: "The “son” position sees only “Alice son”, the same input as the atomic fact that gives Bob. " +
               "Its state is H<sup>(1)</sup><sub>2</sub> (position 1 in the paper, which counts from 0)." },
      { steps: [3, 4],
        big: "Decoded through W, it puts essentially all its probability on Bob.",
        small: "This is a logit lens: apply the output head W to an intermediate state, z = WH<sup>(1)</sup><sub>2</sub>, " +
               "then p = softmax(z). Loop 2 has not run yet." },
      { steps: [5, 6],
        big: "The bridge is decodable, even on OOD questions.",
        small: "Table 1b: P(Bob | H<sup>(1)</sup><sub>2</sub>) = 1.000 on both <span class=\"blue\">test_id</span> and " +
               "<span class=\"purple\">test_ood</span>, averaged over all test questions, each with its own true bridge in place of Bob." }
  ] },

  { type: "statement",
    big: "Bob is there before loop 2. Why does loop 2 still miss?" },

  { type: "scrolly", scene: "Part4C_Mismatch", groups: [
      { steps: [0, 1],
        big: "Is this hidden state the same as Bob’s clean embedding?",
        small: "If H<sup>(1)</sup><sub>2</sub> were W[Bob], loop 2 would get Bob as a clean token, " +
               "the kind of input the block already handles in atomic facts like “Bob wife ?”." },
      { steps: [2, 4],
        big: "Decoding can’t tell: many vectors give the same readout.",
        small: "The readout only sees p = softmax(WH). Adding the same c to every logit leaves p unchanged, and once " +
               "Bob’s logit leads by a wide margin, p is already one-hot. A perfect decode does not pin down the vector." },
      { steps: [5, 7],
        big: "Hidden states and embeddings may live in <em>different regions</em>.",
        small: "Same space, but loop outputs and token embeddings need not overlap. " +
               "H<sup>(1)</sup><sub>2</sub> can sit far from W[Bob] and still give the same p, with Bob on top." },
      { steps: [8, 10],
        big: "Measured directly, the hidden state is <em>not</em> W[Bob].",
        small: "Cosine similarity (1 means the same direction) between H<sup>(1)</sup><sub>2</sub> and W[Bob]: " +
               "0.327 on <span class=\"blue\">test_id</span>, 0.266 on <span class=\"purple\">test_ood</span>, far from 1. " +
               "Loop 2 gets a noisy mixture, not a clean copy of Bob." }
  ] },

  { type: "scrolly", scene: "Part4D_Intervention", groups: [
      { steps: [0, 1],
        big: "Test it: mix the clean embedding back in, without training.",
        small: "Eq. 3, between the loops, at the bridge position only: H<sup>(1)</sup><sub>2</sub> ← (1 − α) H<sup>(1)</sup><sub>2</sub> + " +
               "α Norm(W[b<sub>max</sub>]). b<sub>max</sub> is the model’s own top decoded token (here Bob), not the label." },
      { steps: [2, 3],
        big: "The bridge state turns partly clean; loop 2 runs unchanged.",
        small: "α sets the mix: α = 0 keeps the original state, and α = 1 replaces it entirely " +
               "with the normalized embedding Norm(W[Bob])." },
      { steps: [4, 5],
        big: "As α grows, OOD accuracy climbs from about 8% to over 95%.",
        small: "Two-hop accuracy as α sweeps from 0 to 1. <span class=\"purple\">test_ood</span> is about 87% at α = 0.5 " +
               "and above 95% by α ≈ 0.6, a more than ten-fold gain. <span class=\"blue\">test_id</span> climbs to near 100% too." },
      { steps: [6, 6],
        big: "Thus, the <em>hand-off</em> between loops is the problem.",
        small: "Loop 1 hands loop 2 a vector that decodes to Bob but sits far from W[Bob]: a misaligned representation. " +
               "Mixing in the clean embedding at that one position recovers near-perfect accuracy." }
  ] }
];
