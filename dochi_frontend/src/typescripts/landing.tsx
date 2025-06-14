import Dochi from "./dochi";
import GradientBackground from "./gradient-bg";
import FlippedGradientBackground from "./gradient-bg-flipped";
import NavLanding from "./nav-landing";

function Landing() {

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
            <section id="login">
            </section>
        </GradientBackground>


        
      </div>    
    </>
  )
}

export default Landing;