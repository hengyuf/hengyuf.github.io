// The paragraph of each animated page, shown beside (wide screens) or above its animation.
// Keys: the block's scene names joined with "+", or astra / jev / results for the html visuals.
// Each part is tagged with the step (group, from 0) whose animation it describes; the part of the
// step on screen is highlighted, and clicking a part jumps to its step. The per-step captions in the
// other content files are no longer shown on the page (the Twitter clips still use them).
window.BLOG_TEXT = {
  "astra": [
    { g: 0, html: "In an example from the GPT-6 Astra System Card, models are told not to reason about the question." },
    { g: 1, html: "GPT-5.5 Thinking and GPT-5.6 Sol still name William Clark in their chain of thought." },
    { g: 2, html: "GPT-6 Astra also answers correctly without writing any step down. This is <em>implicit reasoning</em>." },
  ],
  "jev": [
    { g: 0, html: "Jev is TypeSafe AI’s “System 1” model and answers fast with no chain of thought. When asked one hop at a time, it knows each fact for sure." },
    { g: 1, html: "But when the two hops are chained into one question, it only guesses." },
    { g: 2, html: "Knowing the facts is not the same as <em>composing</em> them." },
  ],
  "Scene1_Example": [
    { g: 0, html: "The model learns two facts in training rather than from the prompt. Alice’s son is Bob, and Bob’s wife is Carol." },
    { g: 1, html: "Chaining them answers the <i>two-hop</i> question “Who is Alice’s son’s wife?” with Carol." },
    { g: 2, html: "Bob is the <em>bridge</em>, and since the question never names him, the model must find and use him within one forward pass." },
  ],
  "Scene2_Abstraction+Scene3_Splits": [
    { g: 0, html: "Names become tokens, and two-hop questions hide the bridge." },
    { g: 1, html: "The facts form a graph." },
    { g: 2, html: "We build an ID graph and an OOD graph that share relations but not entities." },
    { g: 3, html: "Training uses every fact of both graphs (<span class=\"green\">train_atom</span>) but two-hop questions only from ID (<span class=\"green\">train_id</span>)." },
    { g: 4, html: "Testing uses new ID questions (<em>test_id</em>) and stricter OOD questions (<em>test_ood</em>) whose facts were only seen alone." },
  ],
  "results": [
    { g: 0, html: "A standard Transformer trained from scratch memorizes the training set but fails to <em>compose</em>." },
    { g: 1, html: "Its accuracy on test_id is poor," },
    { g: 2, html: "and on test_ood it fails. Why is it poor on both test sets, and so much worse on OOD?" },
  ],
  "Part2_VanillaFails": [
    { g: 0, html: "Composing needs the first fact in an earlier layer than the second," },
    { g: 1, html: "but nothing forces that order, and training gives OOD facts even less reason to follow it." },
    { g: 2, html: "If the order is reversed, Layer 2’s fact goes unused," },
    { g: 3, html: "because Bob only arrives at Layer 4 and is too late for the second hop." },
    { g: 4, html: "The fact is stored, but in a layer the pass has already left. This is the <em>depth-local storage</em> problem that prior work described (<a class=\"cite\" href=\"https://arxiv.org/abs/2406.12775\" target=\"_blank\" rel=\"noopener\">Biran&nbsp;et&nbsp;al.</a>; <a class=\"cite\" href=\"https://arxiv.org/abs/2405.15071\" target=\"_blank\" rel=\"noopener\">Wang&nbsp;et&nbsp;al.</a>)." },
  ],
  "Part3_LoopedTransformer": [
    { g: 0, html: "A looped Transformer folds every layer into one block <i>f</i><sub>θ</sub> that holds both facts." },
    { g: 1, html: "It then runs that block twice and uses one loop per hop." },
    { g: 2, html: "Loop 1 recalls the first fact, and Bob appears." },
    { g: 3, html: "Loop 2 uses Bob to find Carol." },
    { g: 4, html: "Both loops read <em>one memory</em>, so storage order no longer blocks the second hop." },
  ],
  "Slide7_LoopVsNoLoop": [
    { g: 0, html: "On two-hop test accuracy, the vanilla loop (<span class=\"blue\">blue</span>) beats a no-loop model with twice as many parameters (<span class=\"mute\">gray</span>) by far, but it needs long training." },
    { g: 1, html: "Its ID accuracy is still imperfect, and OOD is only <em>8.3%</em>." },
    { g: 2, html: "Every loop reaches every fact, yet composition still breaks." },
  ],
  "Part4A_Stage1": [
    { g: 0, html: "The vanilla loop runs the same block <i>f</i><sub>θ</sub> twice on “Alice son wife ?”" },
    { g: 1, html: "and reads out Carol through <i>W</i>." },
    { g: 2, html: "The <em>Stage-1 prediction</em> after one loop has no two-hop answer yet," },
    { g: 3, html: "but on a single fact it already answers correctly with Bob." },
    { g: 4, html: "One loop gets every fact right but almost no two-hop answers," },
    { g: 5, html: "so loop 2 does the composing, and storage is not the problem." },
  ],
  "Part4B_Bridge": [
    { g: 0, html: "Let’s do a mechanistic analysis at the bridge position and look at the hidden state at “son” after loop 1." },
    { g: 1, html: "A <em>logit lens</em> decodes this state through <i>W</i>, and the readout puts essentially all its probability on Bob." },
    { g: 2, html: "The true bridge of every test question is decodable on <span class=\"blue\">test_id</span> and even on <span class=\"purple\">test_ood</span>." },
  ],
  "Part4C_Mismatch": [
    { g: 0, html: "Is this hidden state the same as Bob’s clean embedding <i>W</i>[Bob]?" },
    { g: 1, html: "Decoding cannot tell, because many vectors give the same readout," },
    { g: 2, html: "so the two may live in <em>different regions</em>." },
    { g: 3, html: "Cosine similarity on <span class=\"blue\">test_id</span> and <span class=\"purple\">test_ood</span> shows directly that the hidden state is not <i>W</i>[Bob]." },
  ],
  "Part4D_Intervention": [
    { g: 0, html: "We test this without training by mixing Bob’s clean embedding back into the bridge state between the loops." },
    { g: 1, html: "The weight α sets how much is mixed in. The bridge state becomes partly clean, and loop 2 itself runs unchanged." },
    { g: 2, html: "As α grows, OOD accuracy climbs from about 8% to over 95%." },
    { g: 3, html: "Thus, the <em>hand-off</em> between loops is the problem." },
  ],
  "Part5A_DiscoLoop+Part5B_EveryPosition+Part5C_Gate": [
    { g: 0, html: "DiscoLoop <span class=\"blue\">loops</span> <em>discrete embeddings</em> and <span class=\"mute\">continuous hidden states</span>." },
    { g: 1, html: "Take the bridge state <i>h</i>," },
    { g: 2, html: "<span class=\"blue\">decode</span> it, <span class=\"blue\">encode</span> it into a soft <i>W</i>[Bob], and add that to <i>h</i>." },
    { g: 3, html: "Φ is a soft decode-then-encode intervention" },
    { g: 4, html: "applied at every position." },
    { g: 5, html: "Every loop reuses <i>f</i><sub>θ</sub>" },
    { g: 6, html: "and keeps each hidden state while adding its decoded embedding." },
    { g: 7, html: "A gate <span class=\"green\">α</span> sets how much embedding each token gets," },
    { g: 8, html: "and can be fixed or learnable." },
  ],
  "Part6A_Symbolic": [
    { g: 0, html: "On the symbolic task, DiscoLoop reaches near-perfect accuracy <em>even on OOD</em> and beats both the vanilla loop and a larger no-loop model." },
    { g: 1, html: "If one loop alone answers two-hop training questions, the answers were memorized." },
    { g: 2, html: "All models memorize first, and looped models then drop the shortcut." },
    { g: 3, html: "Early on, DiscoLoop also memorizes the two-hop questions." },
    { g: 4, html: "Then it decomposes into hops, and test accuracy jumps." },
  ],
  "Part6B_Language": [
    { g: 0, html: "Next, we write the same task in English and turn entities into names and relations into words." },
    { g: 1, html: "Each fact becomes a sentence such as “Finley’s teacher is Anya.”" },
    { g: 2, html: "A direct two-hop question names the relations in order, while a reverse one names them backwards." },
    { g: 3, html: "In English too, only DiscoLoop generalizes OOD in both formats." },
  ],
  "Part6C_Pretraining": [
    { g: 0, html: "The last test is real language-model pretraining. The vanilla loop and DiscoLoop both have 440M parameters and differ only in the recurrence." },
    { g: 1, html: "In training loss, the vanilla loop starts ahead, but after ≈13B tokens DiscoLoop pulls ahead." },
    { g: 2, html: "DiscoLoop also raises the average zero-shot score over seven benchmarks from <em>49.3 to 50.5</em>." },
  ],
  "Part7A_LengthGen": [
    { g: 0, html: "The first open question is whether DiscoLoop achieves <em>length generalization</em> to longer chains." },
    { g: 1, html: "We train only on one-hop and two-hop questions and always use <i>K</i>&nbsp;=&nbsp;2 loops," },
    { g: 2, html: "then add one loop and test on three-hop questions with <i>K</i>&nbsp;=&nbsp;3." },
    { g: 3, html: "If it works, harder questions simply get more loops." },
  ],
  "Part7B_ScalableLoops": [
    { g: 0, html: "The second open question is how far looping can scale. Each loop reuses <i>f</i><sub>θ</sub>, so more loops add compute but no parameters." },
    { g: 1, html: "But training backpropagates through every loop, and many loops make a very deep network." },
  ],
};
