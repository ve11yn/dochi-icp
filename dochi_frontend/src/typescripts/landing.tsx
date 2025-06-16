import React, { useState } from "react";
import Dochi from "./dochi";
import GradientBackground from "./gradient-bg";
import FlippedGradientBackground from "./gradient-bg-flipped";
import NavLanding from "./nav-landing";

function Landing() {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you can add your API call to submit the email
      // For now, we'll just show an alert
      console.log('Subscribing email:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Thank you! We'll notify ${email} about our updates.`);
      
      // Clear the form
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div>
        <GradientBackground>
            <NavLanding/>

            <section id="top" className="pt-50 px-8 pb-20">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl font-medium text-gray-900">
                        Level Up Your <span className="text-gray-900 font-light">Productivity</span>
                    </h1>
                    <h1 className="text-5xl font-medium text-gray-900 mb-6">
                        Powered by the <span className="text-gray-900 font-light italic">Chain</span>.
                    </h1>

                    <p>
                        With private storage, secure identity, and AI integration
                    </p>
                
                    <p className="mb-6">stay focused and in control — always.</p>

                    <div className="flex gap-4 justify-center">
                    
                        <button className="bg-none border border-gray-900 border-1 text-gray-900 px-5 my-1 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                        📄 View Docs
                        </button>

                        <button className="bg-white text-gray-900 px-5 my-1 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                        Get Started
                        </button>
                    </div>
                </div>
            </section>

            <section id="features" className="pt-30 pb-20 px-8">
                <div className="max-w-2xl mx-auto flex flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Meet Dochi!</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Your productivity companion. Dochi's mood changes with your progress — stay productive, 
                            and Dochi stays happy. Skip your tasks, and Dochi turns grumpy — a little nudge to keep you 
                            on track, every day.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Dochi width={320} height={320} />
                    </div>
                </div>

                <div className="max-w-2xl mx-auto flex flex-row items-center gap-12 mt-20">
                    <div className="w-80 h-50 bg-[#E3ECFB] rounded-xl">

                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Capture tasks & thoughts.</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Manage your to-dos and take notes in one clean workspace — securely stored in canisters on the Internet Computer. 
                        </p>
                    </div>
                </div>

                 <div className="max-w-2xl mx-auto flex flex-row items-center gap-12 mt-35">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ask Dochi.</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Your private chatbot assistant — powered by decentralized AI and LLM Canisters — ready to answer questions, organize your tasks, summarize notes, and guide your productivity.
                        </p>
                    </div>
                    <div className="w-80 h-50 bg-[#FBEDF7] rounded-xl">

                    </div>
                </div>

                <div className="max-w-2xl mx-auto flex flex-row items-center gap-12 mt-35">
                    <div className="w-80 h-50 bg-[#FBF1ED] rounded-xl">

                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Your Day.</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Decentralized scheduling with support for event planning and time-blocking — featuring recurring events, reminders, and seamless coordination across your devices.
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto flex flex-row items-center gap-12 mt-35">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Start a Focus Session</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Structured focus sessions with timers to help you dive deep, eliminate distractions, and make meaningful progress.
                        </p>
                    </div>
                    <div className="w-80 h-50 bg-[#E4F6FB] rounded-xl">

                    </div>
                </div>
            </section>

            <section id="about" className="pt-30 pb-20 px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-2xl text-gray-900 font-light mb-2">Powered by</h1>
                        <h1 className="text-5xl font-medium text-gray-900 italic">
                            Internet Computer.
                        </h1>
                    </div>

                    {/* Feature Cards */}
                    <div className="flex flex-row gap-6 justify-center">
                        <div className="w-72 h-64 bg-[#FBEDF7] rounded-3xl p-8 flex flex-col justify-end relative">
                            {/* Large decorative number */}
                            <div className="absolute top-6 right-6 text-8xl font-bold text-pink-200 opacity-50">1</div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                    Seamless Access<br />
                                    with Internet<br />
                                    Identity
                                </h2>
                            </div>
                        </div>

                        <div className="w-72 h-64 bg-[#E3ECFB] rounded-3xl p-8 flex flex-col justify-end relative">
                            {/* Large decorative number */}
                            <div className="absolute top-6 right-6 text-8xl font-bold text-blue-200 opacity-50">2</div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                    Decentralized<br />
                                    Storage
                                </h2>
                            </div>
                        </div>

                        <div className="w-72 h-64 bg-[#E4F6FB] rounded-3xl p-8 flex flex-col justify-end relative">
                            {/* Large decorative number */}
                            <div className="absolute top-6 right-6 text-8xl font-bold text-cyan-200 opacity-50">3</div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                    Smart Assistant<br />
                                    via LLM<br />
                                    Canisters
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section id="contact" className="pt-30 pb-8 px-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-6">
                    <Dochi width={60} height={60} />
                    <h1 className="text-3xl font-bold text-gray-900">Dochi.</h1>
                    </div>
                    
                    {/* Social Media Icons */}
                    <div className="flex gap-4">
                    {/* Twitter/X Icon */}
                    <a href="#" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                    
                    {/* Telegram Icon */}
                    <a href="#" className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                    </a>
          
                    {/* Instagram Icon */}
                    <a href="#" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors">
                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                    </a>
                    </div>
                </div>

   
                <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-widest">CONTACT US</h2>
                    <div className="space-y-3">
                    <p className="text-gray-700 font-small">dochi@email.com</p>
                    <p className="text-gray-700 font-small">+68 812 890 522 08</p>
                    </div>
                </div>

                <div className="text-left">
                    <h2 className="text-xl font-bold font-small text-gray-900 mb-4 tracking-widest">SUBSCRIBE</h2>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    Enter your email to get notified about<br />out new solutions
                    </p>

                    <div className="relative">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 outline-none bg-white text-gray-700 placeholder-gray-400 focus:border-gray-400 focus:shadow-lg transition-all duration-300"
                        placeholder="youremail@gmail.com"
                        required
                        disabled={isSubmitting}
                    />
                    
                    <button
                        type="button"
                        onClick={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget.closest('div');
                        const input = form?.querySelector('input') as HTMLInputElement;
                        if (input) {
                            const syntheticEvent = {
                            preventDefault: () => {},
                            currentTarget: { querySelector: () => input }
                            } as unknown as React.FormEvent<HTMLFormElement>;
                            handleSubmit(syntheticEvent);
                        }
                        }}
                        disabled={isSubmitting || !email}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 focus:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 fill-gray-600"
                        >
                            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                        </svg>
                        )}
                    </button>
                    </div>
                </div>

                </div>
   
                <div className="w-full h-px bg-gray-300 mt-16 mb-8"></div>
                
          
                <div className="text-right">
                <p className="text-gray-500 text-sm">2025 ChingChongFan Inc. All rights reserved</p>
                </div>
            </div>
            </section>

        </GradientBackground>
      </div>    
    </>
  )
}

export default Landing;