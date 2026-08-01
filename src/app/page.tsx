"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Users,
  ArrowRight,
  PawPrint,
  Camera,
  HeartHandshake,
  Check,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { ActivityFeed } from "@/components/feed/activity-feed";

/**
 * Kill switch (H5) for the homepage activity feed. Lets us yank the feed
 * from the homepage without removing it from /memorials if a bad item slips
 * through moderation. Flip to false in an emergency, redeploy, done.
 */
const SHOW_FEED_ON_HOMEPAGE = true;


const OPENING_QUESTIONS = [
  (name: string) => `What's your favorite memory with ${name}?`,
  (name: string) => `What made ${name} special to you?`,
  (name: string) => `What's something about ${name} that always made you smile?`,
  (name: string) => `What would you want people to know about ${name}?`,
  (name: string) => `What's a moment with ${name} you'll never forget?`,
];

function pickOpeningQuestion() {
  return OPENING_QUESTIONS[Math.floor(Math.random() * OPENING_QUESTIONS.length)];
}

/**
 * Cheap pronoun inference (H4). Scans user-typed text for explicit gendered
 * pronouns and returns "male" / "female" / null. Defaults to neutral when
 * no signal — never guesses from name or species. The user can correct in
 * /create's gender field if the inference is wrong or never triggered.
 */
function inferGenderFromText(text: string): "male" | "female" | null {
  const lowered = text.toLowerCase();
  if (/\b(she|her|hers)\b/.test(lowered)) return "female";
  if (/\b(he|him|his)\b/.test(lowered)) return "male";
  return null;
}

const CONVERSATION_STEPS = [
  {
    question: (name: string) =>
      `I'm so sorry about ${name}. What kind of animal were they?`,
    options: ["Dog", "Cat", "Other"],
  },
];

function TypingIndicator() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-amber-400"
          animate={reducedMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: Heart,
    title: "AI-Written Tribute",
    description:
      "Tell us about them and we\u2019ll turn your stories into a tribute that sounds like you wrote it.",
  },
  {
    icon: Camera,
    title: "Photo Gallery",
    description:
      "Their best moments, captioned and arranged into a gallery worth sharing.",
  },
  {
    icon: HeartHandshake,
    title: "Decision Support",
    description:
      "Carrying guilt or second-guessing a decision? You don\u2019t have to sit with that alone.",
  },
  {
    icon: Users,
    title: "Memory Wall",
    description:
      "A place for everyone who loved them to share what they remember.",
  },
];


export default function Home() {
  const router = useRouter();
  const [petName, setPetName] = useState("");
  const [started, setStarted] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  const [messages, setMessages] = useState<
    { role: "assistant" | "user"; content: string }[]
  >([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "neutral" | "">("");
  const [openingQuestion] = useState(() => pickOpeningQuestion());
  const [aiLoading, setAiLoading] = useState(false);
  const [userExchangeCount, setUserExchangeCount] = useState(0);
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chatEndRef.current;
    if (el?.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }, [messages, isTyping, aiLoading]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) return;
    setStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages([
        {
          role: "assistant",
          content: CONVERSATION_STEPS[0].question(petName.trim()),
        },
      ]);
    }, 2000);
  };

  const handleSpeciesSelect = (selected: string) => {
    setSpecies(selected);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: selected },
    ]);
    setIsTyping(true);
    // Skip the gender question (H4): jump straight from species to the
    // memory exchange. Pronouns are inferred from user-typed text in
    // handleMemorySubmit; if never inferred, defaults to neutral.
    setTimeout(() => {
      setIsTyping(false);
      setConversationStep(1);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: openingQuestion(petName.trim()),
        },
      ]);
    }, 1500);
  };

  const handleMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || aiLoading) return;
    const text = userInput.trim();
    setUserInput("");
    setChatError("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setAiLoading(true);

    // Pronoun inference (H4): if we don't have a gender yet and the user's
    // message contains explicit gendered pronouns, lock it in for this and
    // future requests. Once set, never override — first explicit signal wins.
    let effectiveGender = gender;
    if (!effectiveGender) {
      const inferred = inferGenderFromText(text);
      if (inferred) {
        effectiveGender = inferred;
        setGender(inferred);
      }
    }

    try {
      // Build chat history: skip the first 2 messages (species Q/A only —
      // the gender step has been removed in H4).
      const allMessages = [...messages, { role: "user" as const, content: text }];
      const conversationMessages = allMessages.slice(2);

      const res = await fetch("/api/homepage/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petName: petName.trim(),
          species: species === "Other" ? "" : species,
          gender: effectiveGender || undefined,
          chatHistory: conversationMessages,
          exchangeCount: userExchangeCount + 1,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const { reply } = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
      setUserExchangeCount((prev) => prev + 1);
    } catch {
      setChatError("Couldn't connect right now. Your conversation is saved.");
    } finally {
      setAiLoading(false);
    }
  };

  const saveWizardSeed = () => {
    // Skip the first 2 messages (species Q/A) — the gender step was removed in H4.
    const conversation = messages.slice(2);
    const wizardSeed = {
      petName: petName.trim(),
      species: species === "Other" ? "" : species,
      gender: gender || undefined,
      conversation: conversation.length > 0 ? conversation : [],
    };
    localStorage.setItem(
      "petmemorial-wizard-seed",
      JSON.stringify(wizardSeed)
    );
  };

  const handleCreateClick = () => {
    if (petName.trim()) {
      saveWizardSeed();
    }
    router.push("/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-10 pb-6 md:pt-14 md:pb-8">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto max-w-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30"
              >
                <PawPrint className="h-8 w-8 text-amber-600" />
              </motion.div>

              <h1 className="font-serif text-4xl font-medium tracking-tight text-gray-900 dark:text-amber-50 md:text-5xl">
                Remember the joy,
                <br />
                not just how it ended.
              </h1>

              <p className="mt-6 text-lg text-gray-500 dark:text-gray-400">
                Create a beautiful, lasting memorial for the pet who changed your
                life.
              </p>

              <form
                onSubmit={handleNameSubmit}
                className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
              >
                <div className="relative w-full max-w-xs">
                  <Input
                    type="text"
                    placeholder="Your pet's name"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="h-12 rounded-full border-amber-200 bg-white pl-5 pr-4 text-base shadow-sm transition-shadow focus:border-amber-400 focus:ring-1 focus:ring-amber-400 dark:border-amber-800/40 dark:bg-gray-900 dark:text-amber-50 dark:placeholder:text-gray-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!petName.trim()}
                  className="h-12 rounded-full bg-amber-600 px-8 text-base font-medium hover:bg-amber-700 disabled:opacity-40 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
                >
                  Begin their memorial
                </Button>
              </form>

              <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                Photos stay private &nbsp;&middot;&nbsp; No pressure, no timers &nbsp;&middot;&nbsp; Hosted forever
              </p>

              {/* Support door (H1): for visitors who aren't ready to start
                  a memorial yet. Less muted than the trust signal — this is
                  an alternative path, not a footnote. */}
              <p className="mt-5 text-sm text-amber-700/80 dark:text-amber-400/80">
                Not ready to start?{" "}
                <Link
                  href="/support"
                  className="underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-300"
                >
                  Talk it through first &rarr;
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-full max-w-xl"
            >
              <div className="rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-amber-900/30 dark:bg-gray-900/80">
                <div className="mb-4 text-center">
                  <p className="font-serif text-xl text-gray-800 dark:text-amber-100">
                    Tell me about {petName.trim()}
                  </p>
                </div>

                <div className="space-y-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-100"
                            : "bg-amber-50 text-gray-700 dark:bg-amber-950/30 dark:text-amber-100/80"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {(isTyping || aiLoading) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30">
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Species selection buttons */}
                {!isTyping &&
                  conversationStep === 0 &&
                  messages.length === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 flex gap-2"
                    >
                      {CONVERSATION_STEPS[0].options!.map((opt) => (
                        <Button
                          key={opt}
                          variant="outline"
                          onClick={() => handleSpeciesSelect(opt)}
                          className="flex-1 rounded-full border-amber-200 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-800/40 dark:text-amber-200 dark:hover:bg-amber-900/20"
                        >
                          {opt}
                        </Button>
                      ))}
                    </motion.div>
                  )}

                {/* Memory/conversation text input */}
                {!isTyping && !aiLoading && conversationStep === 1 && userExchangeCount < 3 && (
                  <motion.form
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleMemorySubmit}
                    className="mt-4 space-y-2"
                  >
                    <div className="flex gap-2">
                      <textarea
                        value={userInput}
                        onChange={(e) => {
                          setUserInput(e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (userInput.trim())
                              handleMemorySubmit(
                                e as unknown as React.FormEvent
                              );
                          }
                        }}
                        placeholder={userExchangeCount === 0 ? "Share a memory..." : "Tell me more..."}
                        className="flex-1 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm resize-none overflow-hidden leading-snug focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 dark:border-amber-800/40 dark:bg-gray-900 dark:text-amber-50 dark:placeholder:text-gray-500"
                        rows={1}
                        autoFocus
                        disabled={aiLoading}
                      />
                      <Button
                        type="submit"
                        disabled={!userInput.trim() || aiLoading}
                        size="sm"
                        className="rounded-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    {userExchangeCount >= 1 && (
                      <Button
                        type="button"
                        onClick={handleCreateClick}
                        variant="outline"
                        className="w-full rounded-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800/40 dark:text-amber-200 dark:hover:bg-amber-900/20"
                      >
                        Create {petName.trim()}&apos;s Memorial
                      </Button>
                    )}
                    {chatError && (
                      <div className="space-y-1 text-center">
                        <p className="text-xs text-red-500">{chatError}</p>
                        <button
                          type="button"
                          onClick={handleCreateClick}
                          className="text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                          Skip to creator
                        </button>
                      </div>
                    )}
                  </motion.form>
                )}

                {/* CTA only — after 3 exchanges */}
                {!isTyping && !aiLoading && conversationStep === 1 && userExchangeCount >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <Button
                      onClick={handleCreateClick}
                      className="w-full rounded-full bg-amber-600 hover:bg-amber-700 h-11 text-base dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
                    >
                      Create {petName.trim()}&apos;s Tribute
                    </Button>
                  </motion.div>
                )}

                <Link
                  href="/skylar-glenn-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center text-sm text-amber-600 hover:text-amber-700 transition-colors dark:text-amber-400 dark:hover:text-amber-300"
                >
                  Want to see what a memorial looks like first? View an example →
                </Link>
              </div>

              <button
                onClick={handleCreateClick}
                className="mt-4 block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-400"
              >
                Skip to full creator
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Recently remembered — opted-in published memorials from the community
          feed. This is the homepage's main "see real memorials" section; the
          example memorial path lives in the footer. Privacy gates
          (is_published + show_in_feed) are enforced server-side in /api/feed.
          Kill switch above for emergencies.

          No top divider here on purpose — the feed should feel like a natural
          continuation of the hero (the visitor's pet → other people's pets),
          not a new "section" walled off from it. */}
      {SHOW_FEED_ON_HOMEPAGE && <ActivityFeed />}

      {/* Features */}
      <section className="border-t border-amber-200/50 px-4 py-12 sm:py-16 dark:border-amber-900/30">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center font-serif text-3xl font-medium text-gray-900 dark:text-amber-50 md:text-4xl">
                A few small ways to hold them close
              </h2>
              <p className="mt-4 text-center text-gray-500 dark:text-gray-400">
                A beautiful space to celebrate the life you shared.
              </p>

              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="relative rounded-2xl border border-amber-100 bg-white/60 p-6 dark:border-amber-900/30 dark:bg-gray-900/40"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                      <feature.icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-gray-800 dark:text-amber-100">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>


            </div>
      </section>

      {/* Free forever */}
      <section className="border-t border-amber-200/50 px-4 py-12 sm:py-16 dark:border-amber-900/30">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-medium text-gray-900 dark:text-amber-50 md:text-4xl">
            Free. For every pet.
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            No subscription, no hidden fees, no catch.
          </p>

          <div className="mt-10 rounded-3xl border border-amber-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-amber-900/40 dark:bg-gray-900/60 sm:p-10">
            <div className="flex items-baseline justify-center gap-3">
              <span className="font-serif text-5xl font-medium text-amber-600 dark:text-amber-400 sm:text-6xl">
                Free
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Everything included
            </p>

            <ul className="mt-8 space-y-3 text-left">
              {[
                "Memorial page hosted forever",
                "Unlimited photos with AI-written captions",
                "AI-written tribute in your voice",
                "Video reel with transitions",
                "Memory wall for friends & family",
                "Light a candle reactions",
                "Shareable link + beautiful link previews",
                "Decision support for guilt or regret",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/create"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-600 px-8 py-3 text-base font-medium text-white hover:bg-amber-700 transition-colors dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
            >
              Start your memorial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              Once it&apos;s yours, it&apos;s yours forever.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-amber-200/50 px-4 py-12 sm:py-16 dark:border-amber-900/30">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-serif text-3xl font-medium text-gray-900 dark:text-amber-50 md:text-4xl">
            Frequently asked questions
          </h2>

          <div className="mt-10 space-y-3">
            {[
              {
                q: "Can I create memorials for more than one pet?",
                a: "Yes, as many as you'd like. Each pet gets their own memorial page, their own memory wall, their own tribute. From your dashboard you can start a new one anytime, and every memorial is free.",
              },
              {
                q: "How long will my memorial stay up?",
                a: "Forever. That's the whole point. We'll host your memorial for as long as RememberMyPet exists, and if we ever had to shut down, we'd give you at least 90 days notice and a way to export everything.",
              },
              {
                q: "Do I need to sign up before I start?",
                a: "No. You can build your entire memorial (photos, tribute, video reel, everything) without creating an account. We only ask you to sign in when you're ready to save and publish it.",
              },
              {
                q: "Who can see my memorial?",
                a: "Only people you share the link with. Memorials are private by default. If you want, you can opt in to showing yours on the community feed, but that's always your choice and you can turn it off anytime.",
              },
              {
                q: "Can others add photos and memories?",
                a: "Yes. The memory wall lets friends and family share their own photos, stories, and memories. You review each one before it appears publicly, so you stay in control.",
              },
              {
                q: "What about AI? Is my data used to train models?",
                a: "No. We use Claude (from Anthropic) to help you write tributes and caption photos, but none of your memorial content is used to train AI models. Your stories stay yours.",
              },
              {
                q: "Can I delete my memorial?",
                a: "Yes, any time. You can delete your memorial from your dashboard and everything (photos, memories, tribute) is permanently removed.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-amber-100 bg-white/80 p-5 open:shadow-sm dark:border-amber-900/30 dark:bg-gray-900/60"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left font-medium text-gray-900 dark:text-amber-50 list-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="shrink-0 text-amber-600 dark:text-amber-400 transition-transform group-open:rotate-45">
                    <Plus className="h-5 w-5" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Have another question?{" "}
            <a
              href="mailto:team@remembermypet.ai"
              className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-2"
            >
              Get in touch
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
