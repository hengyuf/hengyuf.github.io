// Chapter 05 (first half): DiscoLoop. One pinned block that plays Part5A_DiscoLoop (steps 0-13),
// Part5B_EveryPosition (steps 14-18) and Part5C_Gate (steps 19-23) in a row.
// Paper: Section 4, Eqs. (4)-(6); settings from Sections 5.1 and 5.2.
(window.BLOG_PARTS = window.BLOG_PARTS || {})["discoloop"] = [
  { type: "chapter", id: "discoloop", num: "05", title: "DiscoLoop" },

  { type: "scrolly", scenes: ["Part5A_DiscoLoop", "Part5B_EveryPosition", "Part5C_Gate"], groups: [
      // ---- Part5A_DiscoLoop
      { steps: [0, 1],
        big: "<span class=\"blue\">Loop</span> both <em>discrete embeddings</em> and " +
             "<span class=\"mute\">continuous hidden states</span>: DiscoLoop.",
        small: "This is the lesson of the intervention, turned into a design rule: carry a clean token embedding " +
               "next to the hidden state, both in the loop’s residual stream." },
      { steps: [2, 3],
        big: "Start from the vanilla loop, at the bridge position.",
        small: "Loop 1 runs on “Alice son wife ?”. Take the hidden state at “son”, H<sup>(1)</sup><sub>2</sub>: " +
               "Bob can already be decoded from it. Call it h." },
      { steps: [4, 10],
        big: "<span class=\"blue\">Decode</span> h, <span class=\"blue\">encode</span> it back, and <em>add</em> it onto h.",
        small: "Decode: z = Wh, p = softmax(z/τ), peaked on Bob. Encode: Σ<sub>v</sub> p<sub>v</sub> W[v], a soft " +
               "W[Bob]. RMSNorm and the gate <span class=\"green\">α</span> scale it; it is added, not swapped in, so " +
               "the hidden state survives." },
      { steps: [11, 13],
        big: "Decode-then-encode is one operator, Φ: a soft version of the intervention.",
        small: "Eq. 5: Φ(h) = Σ<sub>v</sub> p<sub>v</sub>(h) W[v], with p(h) = softmax(Wh/τ). As the temperature " +
               "τ → 0, Φ(h) becomes W[b<sub>max</sub>], the embedding the intervention mixed in." },
      // ---- Part5B_EveryPosition
      { steps: [14, 15],
        big: "Φ runs at every position, not just at the bridge.",
        small: "Each hidden state gets its own decoded distribution p and its own injection, so the whole " +
               "row H<sup>(1)</sup> becomes H̃<sup>(1)</sup>. The intervention had to be told where the bridge was; DiscoLoop does not." },
      { steps: [16, 17],
        big: "Loop 1 starts from token embeddings; every loop runs the same f<sub>θ</sub>.",
        small: "H̃<sup>(0)</sup>&nbsp;=&nbsp;W[x], and H<sup>(k+1)</sup>&nbsp;=&nbsp;f<sub>θ</sub>(H̃<sup>(k)</sup>) " +
               "for k&nbsp;=&nbsp;0,&nbsp;…,&nbsp;K−1. Without the injection this is exactly the vanilla loop; " +
               "f<sub>θ</sub> itself is unchanged." },
      { steps: [18, 18],
        big: "The full update keeps the hidden state and adds its decoded embedding.",
        small: "Eq. 4, shown above, applies this to every position at once. The skip connection keeps the " +
               "continuous state; Φ adds the discrete one." },
      // ---- Part5C_Gate
      { steps: [19, 19],
        big: "The gate <span class=\"green\">α</span> sets how much embedding each token gets.",
        small: "α<sup>(k)</sup> = [α<sub>1</sub>, …, α<sub>T</sub>] holds one injection strength per " +
               "position; ⊙ scales each position’s row by its own α<sub>t</sub>." },
      { steps: [20, 23],
        big: "<span class=\"green\">α</span> can be fixed or learnable across token positions.",
        small: "Fixed: the same α<sup>⋆</sup> for every token (symbolic task: α<sup>⋆</sup>&nbsp;=&nbsp;1). Learnable: " +
               "α<sub>t</sub> = σ(⟨w<sub>α</sub>, Φ(H<sub>t</sub>)⟩ + b<sub>α</sub>), only d + 1 extra parameters " +
               "(synthetic language). After the last loop α = 0: the prediction reads H<sup>(K)</sup> directly." } ] },
];
