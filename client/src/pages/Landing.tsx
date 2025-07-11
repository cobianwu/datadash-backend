import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  BarChart3, 
  Brain, 
  Database, 
  LineChart, 
  TrendingUp, 
  Users,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Check,
  Play
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analytics",
      description: "Natural language queries transform into actionable insights. Ask questions in plain English and get instant analysis."
    },
    {
      icon: BarChart3,
      title: "Real-Time KPI Tracking",
      description: "Monitor revenue, EBITDA, customer retention, and 50+ other metrics across your entire portfolio in real-time."
    },
    {
      icon: Database,
      title: "Unified Data Platform",
      description: "Connect Snowflake, BigQuery, Excel, and more. All your data sources in one intelligent platform."
    },
    {
      icon: LineChart,
      title: "Predictive Modeling",
      description: "AI-driven forecasts help you anticipate trends and make proactive decisions before issues arise."
    },
    {
      icon: Users,
      title: "Portfolio-Wide View",
      description: "See performance across all portfolio companies with drill-down capabilities to individual business units."
    },
    {
      icon: Zap,
      title: "Instant Reporting",
      description: "Generate board-ready presentations and Excel reports with one click. Save hours on monthly reporting."
    }
  ];

  const benefits = [
    "Reduce reporting time by 80%",
    "Identify operational issues 3x faster",
    "Make data-driven decisions with confidence",
    "Track 50+ KPIs automatically",
    "Get AI-powered recommendations",
    "Access from anywhere, anytime"
  ];

  const testimonials = [
    {
      quote: "DataFlow transformed how we monitor our portfolio companies. What used to take days now takes minutes.",
      author: "Sarah Chen",
      role: "Managing Partner, Growth Equity Fund"
    },
    {
      quote: "The AI insights alone have helped us identify over $2M in operational improvements across our companies.",
      author: "Michael Rodriguez",
      role: "COO, TechCorp"
    },
    {
      quote: "Finally, a BI tool that understands private equity. The customizable dashboards are game-changing.",
      author: "Jennifer Wu",
      role: "VP Operations, Retail Holdings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">DataFlow Analytics</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Features</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Demo</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Pricing</a>
              <Link href="/login">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/login">
                <Button>Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Business Intelligence Built for Private Equity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Transform your portfolio data into actionable insights. Monitor KPIs, identify opportunities, 
            and make data-driven decisions across all your companies in real-time.
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play className="h-4 w-4" /> Watch Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Portfolio Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$45B</div>
              <div className="text-blue-100">Assets Monitored</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">80%</div>
              <div className="text-blue-100">Time Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">KPIs Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Monitor Your Portfolio</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Purpose-built features for private equity professionals and portfolio company operators
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See DataFlow in Action</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Watch how leading PE firms use DataFlow to transform their portfolio monitoring
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Play className="h-6 w-6" /> Play Demo
                </Button>
              </div>
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-90 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <BarChart3 className="h-20 w-20 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Live Dashboard Demo</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Portfolio Overview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    See all your companies' performance at a glance with customizable KPIs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ask questions in plain English and get instant insights from your data
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">One-Click Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate board presentations and Excel exports in seconds, not hours
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Built for How PE Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Unlike generic BI tools, DataFlow understands the unique needs of private equity. 
              Track portfolio company KPIs, identify value creation opportunities, and streamline reporting—all in one platform.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">23%</h3>
                <p className="text-gray-600 dark:text-gray-400">Average portfolio performance improvement</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-1">92%</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">User satisfaction</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-1">3x</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Faster insights</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Trusted by Leading PE Firms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-8">
                  <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that fits your portfolio size
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="relative">
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$999</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Up to 5 portfolio companies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Core KPI tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Basic AI insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline">Get Started</Button>
            </CardContent>
          </Card>
          
          <Card className="relative border-blue-600 shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>
            </div>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$2,999</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Up to 20 portfolio companies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Advanced AI analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Custom dashboards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>API access</span>
                </li>
              </ul>
              <Button className="w-full mt-6">Get Started</Button>
            </CardContent>
          </Card>
          
          <Card className="relative">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Unlimited companies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>White-label options</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>On-premise deployment</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Portfolio Monitoring?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 500+ portfolio companies already using DataFlow to drive better outcomes
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Your Free Trial <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-blue-100">No credit card required • Full access for 14 days</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">DataFlow</span>
              </div>
              <p className="text-sm">Business intelligence built for private equity</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#demo" className="hover:text-white">Demo</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Security</h3>
              <div className="flex items-center gap-4 mt-4">
                <Shield className="h-8 w-8" />
                <Globe className="h-8 w-8" />
              </div>
              <p className="text-sm mt-2">SOC2 Type II Certified</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 DataFlow Analytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}