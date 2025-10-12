import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, AlertCircle, BarChart3, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              SessionSight
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild className="hover:bg-teal-50 dark:hover:bg-teal-950">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-lg shadow-teal-500/30"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-background dark:from-teal-950/20 dark:via-blue-950/20 dark:to-background" />
        <div className="absolute inset-0 dot-pattern opacity-40" />

        <div className="container mx-auto text-center max-w-4xl relative">
          <Badge
            variant="secondary"
            className="mb-6 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 border-teal-200 dark:border-teal-800"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            For Mental Health Professionals
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
            Understand your clients.
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Improve outcomes.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
            SessionSight helps therapists track client engagement, identify at-risk clients early, and make data-driven
            decisions to improve treatment outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-xl shadow-teal-500/30"
              asChild
            >
              <Link href="/auth/sign-up">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950 bg-transparent"
              asChild
            >
              <Link href="#benefits">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                transform your practice
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful insights that help you provide better care and grow your practice
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 border border-teal-100 dark:border-teal-900 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Track Engagement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor session attendance, cancellation patterns, and engagement metrics across your entire practice in
                real-time.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Early Warnings</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get alerts when clients show signs of disengagement. Reach out proactively before they drop out of
                treatment.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-indigo-950/30 dark:to-teal-950/30 border border-indigo-100 dark:border-indigo-900 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Better Outcomes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track progress ratings and mood trends. Use data-driven insights to adjust treatment plans effectively.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-950/10 dark:to-blue-950/10">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">HIPAA Compliant</h3>
              <p className="text-sm text-muted-foreground">Your client data is secure and private</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Easy Setup</h3>
              <p className="text-sm text-muted-foreground">Get started in minutes, not hours</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Actionable Insights</h3>
              <p className="text-sm text-muted-foreground">Clear data that drives better decisions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-600" />
        <div className="absolute inset-0 dot-pattern opacity-20" />

        <div className="container mx-auto text-center max-w-3xl relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to transform your practice?</h2>
          <p className="text-xl text-teal-50 mb-10 leading-relaxed">
            Join therapists who are using data to improve client outcomes and grow their practice.
          </p>
          <Button size="lg" className="text-lg px-8 bg-white text-teal-600 hover:bg-teal-50 shadow-2xl" asChild>
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                SessionSight
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
              © 2025 SessionSight. Built for mental health professionals.
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
