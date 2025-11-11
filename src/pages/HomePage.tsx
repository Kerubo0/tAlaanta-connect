import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Globe, DollarSign, Rocket, Star, Users, TrendingUp } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Gradient Background */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float delay-1000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <div className="inline-block mb-6">
              <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/30 animate-shimmer">
                🚀 The Future of Freelancing is Here
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 text-white drop-shadow-2xl animate-scale-up delay-200">
              Decentralized Freelancing,<br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 text-transparent bg-clip-text animate-gradient">
                Zero Platform Fees
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow-lg animate-fade-in-up delay-400">
              Connect directly with clients and freelancers through Web3. 
              Trustless escrow, instant settlements, and transparent reputation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 hover:scale-110 transition-all shadow-2xl text-lg px-8 py-6 animate-slide-in-left delay-500 animate-pulse-glow" asChild>
                <Link to="/jobs">
                  <Rocket className="mr-2 h-5 w-5 animate-wiggle" />
                  Find Work
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 hover:scale-110 transition-all text-lg px-8 py-6 animate-slide-in-right delay-700" asChild>
                <Link to="/post-job">
                  <Star className="mr-2 h-5 w-5 animate-heartbeat" />
                  Post a Job
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="container mx-auto mt-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { number: '10K+', label: 'Active Users', icon: Users },
              { number: '$2M+', label: 'Paid Out', icon: DollarSign },
              { number: '5K+', label: 'Jobs Posted', icon: TrendingUp },
              { number: '0%', label: 'Platform Fee', icon: Star },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all hover:scale-110 animate-scale-up cursor-pointer group"
                style={{ animationDelay: `${800 + index * 150}ms` }}
              >
                <stat.icon className="h-8 w-8 text-yellow-300 mx-auto mb-2 group-hover:animate-bounce-slow" />
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text animate-scale-up">
              Why TalentBridge?
            </h2>
            <p className="text-xl text-gray-600 animate-fade-in-up delay-200">Experience the power of decentralized work</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: DollarSign,
                title: 'Zero Fees',
                description: 'No platform fees. Keep 100% of your earnings.',
                color: 'from-green-400 to-emerald-600',
                bgColor: 'bg-green-50',
              },
              {
                icon: Shield,
                title: 'Trustless Escrow',
                description: 'Smart contracts protect both parties with milestone-based payments.',
                color: 'from-blue-400 to-indigo-600',
                bgColor: 'bg-blue-50',
              },
              {
                icon: Zap,
                title: 'Instant Settlement',
                description: 'Get paid immediately when milestones are approved.',
                color: 'from-yellow-400 to-orange-600',
                bgColor: 'bg-yellow-50',
              },
              {
                icon: Globe,
                title: 'On-Chain Reputation',
                description: 'Build a verifiable reputation that follows you everywhere.',
                color: 'from-purple-400 to-pink-600',
                bgColor: 'bg-purple-50',
              },
            ].map((feature, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 ${feature.bgColor} animate-slide-in-left overflow-hidden group cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 animate-rotate-in delay-${index * 100}`}>
                    <feature.icon className="h-full w-full text-white" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-purple-600 transition-colors">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 relative overflow-hidden">
        {/* Additional floating elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float delay-500"></div>
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-float delay-1500"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 animate-scale-up">
            <h2 className="text-5xl font-extrabold mb-4 text-white">How It Works</h2>
            <p className="text-xl text-white/90 animate-fade-in-up delay-200">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Connect Wallet',
                description: 'Connect your MetaMask or WalletConnect wallet. Create your profile as a freelancer or client.',
                gradient: 'from-pink-500 to-rose-500',
              },
              {
                step: 2,
                title: 'Create Contract',
                description: 'Post jobs or apply to opportunities. Set milestones and lock funds in the escrow contract.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                step: 3,
                title: 'Deliver & Get Paid',
                description: 'Submit work, get approved, and receive instant payment. Leave reviews to build reputation.',
                gradient: 'from-purple-500 to-indigo-500',
              },
            ].map((item, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all hover:scale-105 animate-slide-in-right overflow-hidden group cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader>
                  <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center font-bold text-3xl mb-4 text-white shadow-xl animate-scale-up group-hover:animate-heartbeat`}
                    style={{ animationDelay: `${300 + index * 150}ms` }}
                  >
                    {item.step}
                  </div>
                  <CardTitle className="text-2xl text-white group-hover:scale-105 transition-transform">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 text-lg">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30 animate-float delay-1000"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 shadow-2xl animate-scale-up hover:scale-105 transition-transform duration-500 animate-pulse-glow">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white animate-fade-in-up">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-10 animate-fade-in-up delay-200">
              Join the future of freelancing. No middlemen, no fees, just direct work relationships.
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 hover:scale-110 transition-all shadow-xl text-lg px-10 py-6 animate-slide-in-left delay-400 group" asChild>
              <Link to="/jobs">
                <Rocket className="mr-2 h-6 w-6 group-hover:animate-wiggle" />
                Explore Opportunities
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
