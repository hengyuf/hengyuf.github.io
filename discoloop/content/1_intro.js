// Part "intro": chapter 01 (compositional reasoning without writing it down) and chapter 02 (synthetic two-hop reasoning).
(window.BLOG_PARTS = window.BLOG_PARTS || {})["intro"] = [

  // ------------------------------------------------------------------ 01 · motivation
  { type: "chapter", id: "puzzle", num: "01", title: "Compositional reasoning without writing it down" },

  { type: "astra",
    big: "Unlike earlier GPT models, GPT-6 Astra answers without writing any step down.",
    small: "From the GPT-6 Astra System Card: told not to reason about the question, GPT-5.5 Thinking and GPT-5.6 Sol still name William Clark in their chain of thought. Astra’s chain of thought describes a calm visual scene, yet it answers correctly too.",
    def: "<b>Implicit reasoning</b>: the steps happen inside the model, not in the text it writes." },

  { type: "jev",
    big: "Jev knows each fact for sure.",
    small: "Jev is TypeSafe AI’s “System 1” model: fast, intuitive answers given as probabilities over candidate answers, with no chain of thought. Asked one hop at a time, it puts 1.00 on the right answer.",
    chained: "Chained, it only guesses.",
    verdict: "Knowing the facts is not the same as <em>composing</em> them." },

  { type: "question", big: "Can LLMs do <em>implicit multi-hop</em> reasoning?" },

  // ------------------------------------------------------------------ 02 · test bed
  { type: "chapter", id: "testbed", num: "02", title: "Synthetic two-hop reasoning" },

  { type: "scrolly", scene: "Scene1_Example", groups: [
      { steps: [0, 2],
        big: "Two facts: Alice’s son is Bob, and Bob’s wife is Carol.",
        small: "Each fact is a single link between two names. The model learns it in training and stores it in its weights; it is not given in the prompt." },
      { steps: [3, 5],
        big: "Who is Alice’s son’s wife? Chain the two facts: Carol.",
        small: "This is a <i>two-hop</i> question, one hop per fact. To answer it, the model must compose Fact 1 with Fact 2." },
      { steps: [6, 6],
        big: "Bob is the <em>bridge</em>, yet the question never names him.",
        small: "Finding Bob is the hidden first hop. With no chain of thought, the model must find him and use him within one forward pass (a single run through its layers)." },
  ] },

  { type: "scrolly", scenes: ["Scene2_Abstraction", "Scene3_Splits"], groups: [
      { steps: [0, 3],
        big: "Names become tokens, questions hide the bridge.",
        small: "Each fact (an <i>atomic fact</i>) is three tokens and one training example. A two-hop question " +
               "drops the bridge, so the model must predict the answer directly, without ever writing b." },
      { steps: [4, 5],
        big: "The facts form a graph.",
        small: "Facts are edges, so a two-hop question is a path of length two." },
      { steps: [6, 7],
        big: "We build two graphs with different entities but the same relations.",
        small: "An in-distribution (ID) graph <i>G</i><sub>A</sub> and an out-of-distribution (OOD) graph <i>G</i><sub>B</sub>. Since the relations are shared, the same relation chain can be asked on either graph. Their shapes need not match." },
      { steps: [8, 11],
        big: "Training: every fact of both graphs, but two-hop questions <em>only</em> from ID.",
        small: "<span class=\"green\">train_atom</span>: all 10,000 atomic facts, 5,000 per graph. " +
               "<span class=\"green\">train_id</span>: 10,000 two-hop questions from <i>G</i><sub>A</sub>. " +
               "On <i>G</i><sub>B</sub>, facts are seen only on their own, never inside a question." },
      { steps: [12, 13],
        big: "Testing: new questions on the ID graph, and on the OOD graph.",
        small: "<em>test_id</em>: 2,000 held-out chains from <i>G</i><sub>A</sub>. <em>test_ood</em>: 2,000 questions " +
               "from <i>G</i><sub>B</sub>, a stricter test: the rule learned on <i>G</i><sub>A</sub> must work on facts " +
               "the model has only ever seen alone." },
  ] },

  { type: "results",
    big: "A standard Transformer memorizes the training set but fails to <em>compose</em>.",
    small: "A 4-layer Transformer (<i>d</i> = 768), trained from scratch for 3,000 epochs. Data: 500 entities per graph, 50 shared relations, 10 facts per entity. Accuracy counts how often the top predicted token is the answer.",
    question: "Why poor on both test sets, and so much worse on OOD?" },
];
