"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Users,
  Film,
  ShoppingBag,
  ArrowRight,
  PawPrint,
  Camera,
  Check,
} from "lucide-react";
import Link from "next/link";

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

const CONVERSATION_STEPS = [
  {
    question: (name: string) =>
      `I'm so sorry about ${name}. What kind of animal were they?`,
    options: ["Dog", "Cat", "Other"],
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-amber-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
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
      "Share your memories in a guided conversation and we'll craft a heartfelt tribute that captures who they were.",
  },
  {
    icon: Camera,
    title: "Photo Gallery",
    description:
      "Upload your favorite photos with AI-generated captions. Arrange them into a beautiful gallery.",
  },
  {
    icon: Users,
    title: "Memory Wall",
    description:
      "Invite friends and family to share their favorite moments, stories, and photos.",
  },
  {
    icon: Film,
    title: "Video Reel",
    description:
      "Turn your photos and clips into a beautiful keepsake video to share or keep forever.",
  },
];

const PRICING_TIERS = [
  {
    name: "Basic",
    price: "$49",
    description: "Everything you need to honor their memory",
    features: [
      "AI-written tribute",
      "Photo gallery with captions",
      "Your memorial page, always online",
      "Shareable link",
      "Memory wall for friends & family",
    ],
  },
  {
    name: "Premium",
    price: "$99",
    description: "The complete memorial experience",
    features: [
      "Everything in Basic",
      "Video reel compilation",
      "Printed memory book",
      "Canvas print",
      "Priority support",
    ],
    popular: true,
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
  const [readyToCreate, setReadyToCreate] = useState(false);
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

    try {
      // Build chat history: skip the first 2 messages (species question + species answer)
      const allMessages = [...messages, { role: "user" as const, content: text }];
      const conversationMessages = allMessages.slice(2); // skip species exchange

      const res = await fetch("/api/homepage/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petName: petName.trim(),
          species: species === "Other" ? "" : species,
          chatHistory: conversationMessages,
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
      setChatError("Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  };

  const saveWizardSeed = () => {
    const conversation = messages.slice(2); // skip species exchange
    const wizardSeed = {
      petName: petName.trim(),
      species: species === "Other" ? "" : species,
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white">
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
              className="mx-auto max-w-lg text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100"
              >
                <PawPrint className="h-8 w-8 text-amber-600" />
              </motion.div>

              <h1 className="font-serif text-4xl font-medium tracking-tight text-gray-900 md:text-5xl">
                Remember the joy,
                <br />
                not just how it ended.
              </h1>

              <p className="mt-6 text-lg text-gray-500">
                Create a beautiful, lasting tribute for the pet who changed your
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
                    className="h-12 rounded-full border-amber-200 bg-white pl-5 pr-4 text-base shadow-sm transition-shadow focus:shadow-amber-100/50 focus:border-amber-300"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!petName.trim()}
                  className="h-12 rounded-full bg-amber-600 px-6 text-base font-medium hover:bg-amber-700 disabled:opacity-40"
                >
                  Begin their tribute
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-4 text-sm text-gray-400">
                Take your time. There&apos;s no rush here.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-full max-w-md"
            >
              <div className="rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                <div className="mb-4 text-center">
                  <p className="font-serif text-xl text-gray-800">
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
                            ? "bg-amber-600 text-white"
                            : "bg-amber-50 text-gray-700"
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
                      <div className="rounded-2xl bg-amber-50">
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
                          className="flex-1 rounded-full border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                        >
                          {opt}
                        </Button>
                      ))}
                    </motion.div>
                  )}

                {/* Memory/conversation text input */}
                {!isTyping && !aiLoading && conversationStep === 1 && !readyToCreate && userExchangeCount < 3 && (
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
                        className="flex-1 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm resize-none overflow-hidden leading-snug focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                        rows={1}
                        autoFocus
                        disabled={aiLoading}
                      />
                      <Button
                        type="submit"
                        disabled={!userInput.trim() || aiLoading}
                        size="sm"
                        className="rounded-full bg-amber-600 hover:bg-amber-700"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    {userExchangeCount >= 1 && (
                      <Button
                        type="button"
                        onClick={handleCreateClick}
                        variant="outline"
                        className="w-full rounded-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        Create {petName.trim()}&apos;s Tribute
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
                {!isTyping && !aiLoading && conversationStep === 1 && !readyToCreate && userExchangeCount >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <Button
                      onClick={handleCreateClick}
                      className="w-full rounded-full bg-amber-600 hover:bg-amber-700 h-11 text-base"
                    >
                      Create {petName.trim()}&apos;s Tribute
                    </Button>
                  </motion.div>
                )}

                {/* CTA after user clicks create */}
                {readyToCreate && !isTyping && !aiLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <Button
                      onClick={() => router.push("/create")}
                      className="w-full rounded-full bg-amber-600 hover:bg-amber-700 h-11 text-base"
                    >
                      Create {petName.trim()}&apos;s Tribute
                    </Button>
                  </motion.div>
                )}
                <Link
                  href="/demo"
                  className="mt-4 block text-center text-sm text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Want to see what a memorial looks like first? View an example →
                </Link>
              </div>

              <button
                onClick={handleCreateClick}
                className="mt-4 block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip to full creator
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Below-fold content */}
      <section className="px-4 py-10 sm:py-12">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center font-serif text-3xl font-medium text-gray-900 md:text-4xl">
                Everything you need to honor their memory
              </h2>
              <p className="mt-4 text-center text-gray-500">
                A beautiful space to celebrate the life you shared.
              </p>

              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-amber-100 bg-white/60 p-6"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                      <feature.icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
      </section>

      {/* Example Memorial */}
          <section className="px-4 py-10 sm:py-12 bg-amber-50/40">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-serif text-3xl font-medium text-gray-900 md:text-4xl">
                See what a memorial looks like
              </h2>
              <p className="mt-4 text-gray-500">
                Browse a sample memorial to see what you&apos;ll create.
              </p>
              <Link
                href="/demo"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-3 text-base font-medium text-white hover:bg-amber-700 transition-colors"
              >
                View example memorial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="px-4 py-10 sm:py-12">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center font-serif text-3xl font-medium text-gray-900 md:text-4xl">
                Simple, one-time pricing
              </h2>
              <p className="mt-4 text-center text-gray-500">
                No subscriptions. One payment, always online.
              </p>

              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                {PRICING_TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative rounded-2xl border p-6 sm:p-8 ${
                      tier.popular
                        ? "border-amber-300 bg-amber-50/50 shadow-md"
                        : "border-amber-100 bg-white/60"
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-600 px-3 py-0.5 text-xs font-medium text-white">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-serif text-xl font-medium text-gray-900">
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {tier.description}
                    </p>
                    <p className="mt-4">
                      <span className="text-4xl font-semibold text-gray-900">
                        {tier.price}
                      </span>
                      <span className="ml-1 text-sm text-gray-400">
                        one-time
                      </span>
                    </p>
                    <ul className="mt-6 space-y-3">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => router.push("/create")}
                      className={`mt-8 w-full h-12 rounded-full text-base font-medium ${
                        tier.popular
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      Get started
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonial + Trust Signals */}
          <section className="px-4 py-10 sm:py-12 bg-amber-50/40">
            <div className="mx-auto max-w-2xl text-center">
              <blockquote className="font-serif text-xl italic text-gray-600 md:text-2xl">
                &ldquo;I finally felt like I could breathe again. Like she was
                being remembered the way she deserved.&rdquo;
              </blockquote>
              <p className="mt-4 text-sm text-gray-400">
                &mdash; Sarah, remembering Luna
              </p>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Camera className="h-4 w-4" /> Your photos stay private
                </span>
                <span>No pressure, no timers</span>
                <span>Hosted forever</span>
              </div>
            </div>
      </section>
    </div>
  );
}
