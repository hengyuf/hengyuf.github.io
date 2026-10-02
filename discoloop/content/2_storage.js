// Part "storage": chapter 03 (why vanilla Transformers fail) and the start of chapter 04 (why vanilla looped Transformers fail).
// Scenes: Part2_VanillaFails (steps 0-10), Part3_LoopedTransformer (steps 0-9),
// Slide7_LoopVsNoLoop (steps 0-4).
(window.BLOG_PARTS = window.BLOG_PARTS || {})["storage"] = [

  // ------------------------------------------------------------------ 03 · storage
  { type: "chapter", id: "storage", num: "03", title: "Why vanilla Transformers fail?" },

  { type: "scrolly", scene: "Part2_VanillaFails", groups: [
      { steps: [0, 1],
        big: "Composing needs the first fact in an earlier layer than the second.",
        small: "Read the Transformer as a stack of layers, shallow to deep; each fact is recalled at " +
               "some layer ℓ. With ℓ₁&nbsp;&lt;&nbsp;ℓ₂, early layers find the bridge Bob, " +
               "and later layers use Bob to look up Carol." },
      { steps: [2, 3],
        big: "But nothing forces that order.",
        small: "The two facts may sit in the same layer (ℓ₁&nbsp;=&nbsp;ℓ₂) or in reverse " +
               "(ℓ₁&nbsp;&gt;&nbsp;ℓ₂). OOD facts are only ever trained on their own, never inside a " +
               "two-hop question, so training has even less reason to put them in the right layer." },
      { steps: [4, 5],
        big: "In the reversed case, Layer 2’s fact goes unused.",
        small: "Each row now spans the tokens Alice, son, wife, and the input moves down one layer at a " +
               "time. Layer 2 stores “Bob’s wife is Carol”, but Bob has not been found yet." },
      { steps: [6, 8],
        big: "Bob arrives at Layer 4, too late for the second hop.",
        small: "Layer 4 recalls “Alice’s son is Bob”, and Bob appears at the “son” position. Layers 5 " +
               "and 6 now ask “Bob’s wife?”, but they hold no such fact (∅), so the output stays “?”." },
      { steps: [9, 10],
        big: "The fact is stored, just in a layer the pass has already left.",
        small: "This is the <em>depth-local storage</em> problem described in prior work (Biran et al., " +
               "<i>Hopping too late</i>; Wang et al., <i>Grokked transformers are implicit reasoners</i>). " +
               "The figure is a simplified picture, not a measurement of our model." } ] },

  // ------------------------------------------------------------------ 04 · looping
  { type: "chapter", id: "looping", num: "04", title: "Why vanilla looped Transformers fail?" },

  { type: "scrolly", scene: "Part3_LoopedTransformer", groups: [
      { steps: [0, 1],
        big: "Fold every layer into one block, with one memory.",
        small: "Start from the same stack, facts in reversed order. f<sub>θ</sub> stands for the whole " +
               "stack of Transformer layers, not a single layer; both facts now live in its weights." },
      { steps: [2, 3],
        big: "Then run that block twice: one loop per hop.",
        small: "H<sup>(0)</sup>&nbsp;=&nbsp;W[x] embeds the tokens, and each loop feeds its output back " +
               "in, with K&nbsp;=&nbsp;2 loops. The same embedding matrix W also reads out the answer." },
      { steps: [4, 6],
        big: "Loop 1 recalls the first fact, and Bob appears.",
        small: "Each block is now a bar across the tokens Alice, son, wife. In H<sup>(1)</sup>, the hidden " +
               "states after loop 1, Bob sits at the “son” position. The second-hop fact is not used yet." },
      { steps: [7, 8],
        big: "Loop 2 uses Bob to find Carol.",
        small: "The same block runs again. Bob plus “wife” now match “Bob’s wife is Carol”, and Carol " +
               "comes out at the answer position." },
      { steps: [9, 9],
        big: "Both loops read <em>one memory</em>: storage order no longer blocks the second hop.",
        small: "Wherever inside f<sub>θ</sub> a fact is stored, every loop passes through it. So, in " +
               "principle, looping fixes the depth-local storage issue." } ] },

  { type: "statement", big: "Does one shared memory actually help?" },

  { type: "scrolly", scene: "Slide7_LoopVsNoLoop", groups: [
      { steps: [0, 1],
        big: "Looping wins by far, but it needs long training.",
        small: "Two-hop test accuracy during training. <span class=\"blue\">Blue</span>: vanilla loop; " +
               "<span class=\"mute\">gray</span>: no loop; solid lines are ID, dashed are OOD. The looped " +
               "ID curve climbs slowly over thousands of epochs; no loop stays under 20% ID." },
      { steps: [2, 3],
        big: "ID is still imperfect, and OOD is only <em>8.3%</em>.",
        small: "At epoch 3,000: vanilla loop 71.1% ID and 8.3% OOD; no loop 16.9% and 0.8%. Looping is " +
               "a big jump with half the parameters, but it is far from solving the task." },
      { steps: [4, 4],
        big: "Every loop reaches every fact, yet composition still breaks.",
        small: "So storage is no longer the issue. Next: what loop 1 hands to loop 2." } ] },
];
