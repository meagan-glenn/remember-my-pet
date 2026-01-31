"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Camera, Users, Film, ArrowRight, PawPrint } from "lucide-react";

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
      `I'm so sorry about ${name}. What kind of animal was ${name}?`,
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
  const [openingQuestion] = useState(() => pickOpeningQuestion());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) return;
    setStarted(true);
    setIsTyping(true);
    // Longer delay to feel like a real person pausing before responding
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

  const handleMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const memory = userInput.trim();
    setUserInput("");
    setMessages((prev) => [...prev, { role: "user", content: memory }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `That's beautiful. I'd love to help you create a tribute for ${petName.trim()}. Let's make sure ${petName.trim()} is remembered the way they deserve.`,
        },
      ]);
      // Save to localStorage so the wizard can pick it up
      const wizardSeed = {
        petName: petName.trim(),
        species: species === "Other" ? "" : species,
        memory,
      };
      localStorage.setItem(
        "petmemorial-wizard-seed",
        JSON.stringify(wizardSeed)
      );
      setTimeout(() => {
        router.push("/create");
      }, 2000);
    }, 1200);
  };

  const handleSkipToCreate = () => {
    if (petName.trim()) {
      const wizardSeed = {
        petName: petName.trim(),
        species: species === "Other" ? "" : species,
        memory: "",
      };
      localStorage.setItem(
        "petmemorial-wizard-seed",
        JSON.stringify(wizardSeed)
      );
    }
    router.push("/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 md:pt-32 md:pb-24">
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
                className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100"
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

                <div className="space-y-4 min-h-[200px]">
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

                  {isTyping && (
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

                {/* Memory text input */}
                {!isTyping && conversationStep === 1 && messages.length === 3 && (
                  <motion.form
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleMemorySubmit}
                    className="mt-4 flex gap-2"
                  >
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
                          if (userInput.trim()) handleMemorySubmit(e as unknown as React.FormEvent);
                        }
                      }}
                      placeholder="Share a memory..."
                      className="flex-1 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm resize-none overflow-hidden leading-snug focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                      rows={1}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      disabled={!userInput.trim()}
                      size="sm"
                      className="rounded-full bg-amber-600 hover:bg-amber-700"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.form>
                )}
              </div>

              <button
                onClick={handleSkipToCreate}
                className="mt-4 block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip to full creator
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Features Section (below fold) */}
      {!started && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="px-4 pb-24"
        >
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-100 bg-white/60 p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <Heart className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-serif text-base font-medium text-gray-800">
                  Personal Tribute
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Share your memories and we&apos;ll help you find the words
                  that capture who they were.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-white/60 p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-serif text-base font-medium text-gray-800">
                  Memory Wall
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Invite friends and family to share their favorite moments and
                  photos.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-white/60 p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <Film className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-serif text-base font-medium text-gray-800">
                  Video Reel
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Turn your photos and clips into a beautiful keepsake video.
                </p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-16 text-center">
              <blockquote className="font-serif text-lg italic text-gray-600">
                &ldquo;I finally felt like I could breathe again. Like she was
                being remembered the way she deserved.&rdquo;
              </blockquote>
              <p className="mt-3 text-sm text-gray-400">
                &mdash; Sarah, remembering Luna
              </p>
            </div>

            {/* Trust signals */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" /> Your photos stay private
              </span>
              <span>No pressure, no timers</span>
              <span>Hosted permanently</span>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
