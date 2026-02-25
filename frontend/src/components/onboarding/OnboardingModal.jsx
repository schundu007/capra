import { useState } from 'react';

const ONBOARDING_KEY = 'ascend_onboarding_completed';

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

/**
 * Mark onboarding as completed
 */
export function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

/**
 * Reset onboarding (for testing)
 */
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}

/**
 * Onboarding Modal Component - Introduction for new users
 */
export default function OnboardingModal({ isOpen, onComplete, onOpenPricing }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Ascend',
      subtitle: 'Your AI-Powered Interview Prep Assistant',
      content: (
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <img
              src="/ascend-logo.png"
              alt="Ascend"
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-gray-300 text-center">
            Ascend helps you prepare for technical interviews with AI-powered assistance
            for coding challenges, system design, and behavioral questions.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 rounded-lg" style={{ background: '#1a3d2e' }}>
              <div className="text-2xl mb-2">💻</div>
              <div className="text-sm text-emerald-400 font-medium">Coding</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: '#1a2a3a' }}>
              <div className="text-2xl mb-2">🏗️</div>
              <div className="text-sm text-blue-400 font-medium">System Design</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: '#2a1a3a' }}>
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm text-purple-400 font-medium">Behavioral</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'How It Works',
      subtitle: 'Three simple steps to ace your interview',
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
              style={{ background: '#10b981', color: '#fff' }}
            >
              1
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Input Your Problem</h4>
              <p className="text-gray-400 text-sm">
                Paste code, upload screenshots, or share URLs from LeetCode, HackerRank, and more.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
              style={{ background: '#3b82f6', color: '#fff' }}
            >
              2
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Get AI-Powered Solutions</h4>
              <p className="text-gray-400 text-sm">
                Receive optimized code solutions with detailed explanations and complexity analysis.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
              style={{ background: '#8b5cf6', color: '#fff' }}
            >
              3
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Practice & Improve</h4>
              <p className="text-gray-400 text-sm">
                Use follow-up questions, run code, and track your progress across sessions.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Company Interview Prep',
      subtitle: 'Targeted preparation for specific companies',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Create personalized interview prep materials for any company. Get AI-generated:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#242424' }}>
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300">Company-specific interview questions</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#242424' }}>
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300">Culture and values alignment tips</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#242424' }}>
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300">Technical topics to focus on</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#242424' }}>
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300">Behavioral STAR stories</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Credits System',
      subtitle: 'Simple and transparent pricing',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Each credit allows you to create one company interview preparation package.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div
              className="p-4 rounded-lg text-center"
              style={{ background: '#1a3d2e', border: '1px solid #166534' }}
            >
              <div className="text-2xl font-bold text-white">$99</div>
              <div className="text-sm text-emerald-400">Monthly</div>
              <div className="text-xs text-gray-400 mt-1">5 credits/month</div>
            </div>
            <div
              className="p-4 rounded-lg text-center"
              style={{ background: '#1a2a3a', border: '1px solid #1e40af' }}
            >
              <div className="text-2xl font-bold text-white">$200</div>
              <div className="text-sm text-blue-400">Quarterly</div>
              <div className="text-xs text-gray-400 mt-1">5 credits/quarter</div>
            </div>
          </div>
          <div
            className="p-3 rounded-lg text-center mt-2"
            style={{ background: '#242424', border: '1px solid #333' }}
          >
            <span className="text-gray-300">Need more? </span>
            <span className="text-white font-medium">$50 for 5 additional credits</span>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      subtitle: 'Start your interview prep journey',
      content: (
        <div className="space-y-6 text-center">
          <div className="text-6xl">🚀</div>
          <p className="text-gray-300">
            You're ready to start preparing for your dream job interviews.
            Get credits to unlock company-specific prep materials.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => {
                markOnboardingComplete();
                onOpenPricing?.();
                onComplete();
              }}
              className="w-full py-3 rounded-lg font-bold transition-all"
              style={{ background: '#10b981', color: '#ffffff' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#10b981'; }}
            >
              Get Credits & Start
            </button>
            <button
              onClick={() => {
                markOnboardingComplete();
                onComplete();
              }}
              className="w-full py-3 rounded-lg font-medium transition-all"
              style={{ background: '#333333', color: '#ffffff' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#444444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#333333'; }}
            >
              Explore First
            </button>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      markOnboardingComplete();
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    markOnboardingComplete();
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
    >
      <div
        className="relative w-full max-w-lg rounded-xl overflow-hidden"
        style={{ background: '#1a1a1a', border: '1px solid #333333' }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #10b981, #3b82f6)',
            }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">{currentStepData.title}</h2>
            <p className="text-gray-400">{currentStepData.subtitle}</p>
          </div>

          {/* Step content */}
          <div className="min-h-[280px]">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          {!isLastStep && (
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Skip intro
              </button>

              <div className="flex items-center gap-3">
                {!isFirstStep && (
                  <button
                    onClick={handlePrev}
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ background: '#333333', color: '#ffffff' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#444444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#333333'; }}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ background: '#10b981', color: '#ffffff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10b981'; }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: index === currentStep ? '#10b981' : '#333333',
                  transform: index === currentStep ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
