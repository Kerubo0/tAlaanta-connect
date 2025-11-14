import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, DollarSign, Rocket, Star, Users, Heart, Smile, Coffee, Award, Target, CheckCircle, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* Hero Section with Human Touch */}
      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float"></div>
          <div className="absolute top-20 sm:top-40 right-5 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float delay-1000"></div>
          <div className="absolute -bottom-8 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float delay-2000"></div>
          {/* Decorative dots */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-rose-400 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            {/* Human Touch Badge */}
            <div className="inline-flex items-center gap-2 mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                <Heart className="w-4 h-4 animate-heartbeat" fill="currentColor" />
                Made with Love for Freelancers
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 text-gray-900 leading-tight px-4">
              Your Talent Deserves <br />
              <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-transparent bg-clip-text">
                Freedom & Fair Pay
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Connect with amazing clients, work on exciting projects, and keep 100% of what you earn. 
              <span className="block mt-2 text-orange-600 font-semibold">Because your skills matter. ❤️</span>
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap px-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 shadow-xl hover:shadow-2xl hover:scale-105 transition-all px-8 py-6 text-lg group"
                asChild
              >
                <Link to="/jobs" className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all px-8 py-6 text-lg group"
                asChild
              >
                <Link to="/post-job" className="flex items-center gap-2">
                  <Target className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Hire Amazing Talent
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No Platform Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Secure Escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>10K+ Happy Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats with Human Touch */}
        <div className="container mx-auto mt-16 sm:mt-20 relative z-10 px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { number: '10,000+', label: 'Talented Freelancers', icon: Users, emoji: '👥', color: 'from-blue-500 to-cyan-500' },
              { number: '$2M+', label: 'Earned by Freelancers', icon: DollarSign, emoji: '💰', color: 'from-green-500 to-emerald-500' },
              { number: '5,000+', label: 'Projects Completed', icon: Award, emoji: '🎯', color: 'from-purple-500 to-pink-500' },
              { number: '4.9/5', label: 'Average Rating', icon: Star, emoji: '⭐', color: 'from-orange-500 to-rose-500' },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-gray-100 group cursor-pointer"
                style={{ animationDelay: `${800 + index * 150}ms` }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{stat.emoji}</div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} text-transparent bg-clip-text mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Human Touch */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up px-4">
            <div className="inline-block mb-4">
              <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider flex items-center gap-2 justify-center">
                <Sparkles className="w-4 h-4" />
                Why Freelancers Love Us
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
              Work on Your Terms 🎨
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We built this platform thinking about you—the talented person behind the screen
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            {[
              {
                icon: Heart,
                title: 'Keep 100% of Earnings',
                description: 'Every penny you earn is yours. No hidden fees, no surprises. Just fair pay for great work.',
                color: 'from-red-500 to-rose-500',
                bgColor: 'bg-rose-50',
                emoji: '💰',
              },
              {
                icon: Shield,
                title: 'Safe & Secure Payments',
                description: 'Smart contracts protect your work. Get paid when you deliver, every single time.',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-50',
                emoji: '🛡️',
              },
              {
                icon: Coffee,
                title: 'Work-Life Balance',
                description: 'Choose projects you love. Set your own hours. Spend more time with family and friends.',
                color: 'from-amber-500 to-orange-500',
                bgColor: 'bg-amber-50',
                emoji: '☕',
              },
              {
                icon: Smile,
                title: 'Build Your Reputation',
                description: 'Every great project adds to your blockchain-verified reputation. Your skills speak for themselves.',
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50',
                emoji: '⭐',
              },
            ].map((feature, index) => (
              <Card 
                key={index} 
                className={`border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 ${feature.bgColor} group cursor-pointer overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {feature.emoji}
                  </div>
                  <CardTitle className="text-2xl mb-3 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Storytelling Approach */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">Simple & Easy</span>
            <h2 className="text-5xl font-extrabold mb-4 text-gray-900 mt-4">Your Journey Starts Here 🚀</h2>
            <p className="text-xl text-gray-600">Three simple steps to your dream freelance career</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: 1,
                title: 'Create Your Profile',
                description: 'Tell us about yourself, your skills, and what makes you awesome. Add your portfolio and let your work shine!',
                gradient: 'from-orange-500 to-rose-500',
                icon: Users,
                illustration: '👤',
              },
              {
                step: 2,
                title: 'Find Perfect Projects',
                description: 'Browse jobs that match your skills and passion. Apply with confidence knowing payments are secure in escrow.',
                gradient: 'from-blue-500 to-cyan-500',
                icon: Target,
                illustration: '🎯',
              },
              {
                step: 3,
                title: 'Get Paid Instantly',
                description: 'Deliver amazing work, get client approval, and receive payment immediately. Build your reputation with every project!',
                gradient: 'from-green-500 to-emerald-500',
                icon: Award,
                illustration: '💸',
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className="relative"
              >
                {/* Connection Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-gray-300 to-transparent -z-10"></div>
                )}
                
                <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all hover:scale-105 overflow-hidden group cursor-pointer h-full">
                  <CardHeader className="text-center pb-6">
                    {/* Step Number */}
                    <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center font-bold text-4xl mb-6 text-white shadow-lg mx-auto group-hover:scale-110 transition-transform`}>
                      {item.step}
                    </div>
                    
                    {/* Illustration */}
                    <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">
                      {item.illustration}
                    </div>
                    
                    <CardTitle className="text-2xl text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider flex items-center gap-2 justify-center">
              <MessageCircle className="w-4 h-4" />
              Real Stories
            </span>
            <h2 className="text-5xl font-extrabold mb-4 text-gray-900 mt-4">
              What Our Community Says 💬
            </h2>
            <p className="text-xl text-gray-600">Hear from freelancers and clients who found success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Sarah Johnson',
                role: 'UI/UX Designer',
                image: '👩‍💻',
                quote: "Finally, a platform that values my work! No more worrying about platform fees eating my earnings. I've earned 30% more here!",
                rating: 5,
              },
              {
                name: 'Michael Chen',
                role: 'Full Stack Developer',
                image: '👨‍💻',
                quote: "The secure escrow gives me peace of mind. I focus on coding, knowing I'll get paid for every milestone I complete.",
                rating: 5,
              },
              {
                name: 'Emily Rodriguez',
                role: 'Content Writer',
                image: '✍️',
                quote: "I love the flexibility and transparency. Being able to work on my terms while building a verifiable reputation is amazing!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{testimonial.image}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic leading-relaxed">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Warmth */}
      <section className="py-24 px-4 bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float delay-1000"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-7xl mb-6 animate-bounce-slow">🎉</div>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-white">
              Ready to Love Your Work Again?
            </h2>
            <p className="text-2xl text-white/90 mb-10 leading-relaxed">
              Join thousands of freelancers who've found freedom, fair pay, and fulfilling work.
              <span className="block mt-4 font-semibold">Your dream freelance career starts today!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all px-10 py-7 text-xl font-bold group"
                asChild
              >
                <Link to="/jobs" className="flex items-center gap-2">
                  <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                  Start Freelancing Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              
              <span className="text-white text-sm">
                ✨ Free to join • No credit card required
              </span>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>$2M+ Paid to Freelancers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>4.9/5 Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
