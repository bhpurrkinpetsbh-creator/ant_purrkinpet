import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import logo from "@/assets/purrkin-logo.png";
import authDog from "@/assets/auth-dog.png";
import authCatHanging from "@/assets/auth-cat-hanging.png";
import { ArrowLeft, Mail } from "lucide-react";

type AuthView = 'initial' | 'email';
type AuthMode = 'login' | 'signup';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<AuthView>('initial');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto scroll to top when auth page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("login-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("login-password") as HTMLInputElement).value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back to Purrkin Pets!");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("signup-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("signup-password") as HTMLInputElement).value;
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully! Please check your email to verify.");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-white overflow-hidden relative">

      {/* Ambient Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/70 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-orange-50/60 rounded-full blur-3xl opacity-40 mix-blend-multiply" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-50/60 rounded-full blur-3xl opacity-40 mix-blend-multiply" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 z-0 pointer-events-none w-full h-full overflow-hidden">
        {/* Hanging Cat - Top Right */}
        <div className="absolute -top-4 right-10 md:right-20 w-32 md:w-48 animate-float-slow">
          <img
            src={authCatHanging}
            alt="Playful Cat"
            className="w-full object-contain mix-blend-multiply filter brightness-110 contrast-125 opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        {/* Happy Dog - Bottom Left */}
        <div className="absolute -bottom-4 -left-4 md:left-10 w-48 md:w-72 animate-bounce-subtle hidden md:block">
          <img
            src={authDog}
            alt="Happy Dog"
            className="w-full object-contain mix-blend-multiply filter brightness-110 contrast-125 opacity-90 hover:opacity-100 transition-opacity duration-300 transform rotate-12"
          />
        </div>

        {/* Background Patterns (Paw Prints) */}
        <div className="absolute top-20 left-10 text-slate-100 text-6xl transform -rotate-12 animate-pulse">🐾</div>
        <div className="absolute bottom-40 right-20 text-blue-100 text-5xl transform rotate-12 animate-pulse delay-700">🐾</div>
        <div className="absolute top-1/2 left-20 text-orange-100 text-4xl transform -rotate-45 animate-pulse delay-300">🐾</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="Purrkin Pets" className="h-32 w-32 md:h-40 md:w-40" />
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight">Welcome to Purrkin Pets</h1>
          <p className="text-muted-foreground mt-2 text-lg">Your One Stop Pet Paradise</p>
        </div>

        <div className="relative">
          <Card className="p-8 shadow-2xl border-t-4 border-t-primary bg-white/80 backdrop-blur-md border-white/50 ring-1 ring-white/60 relative z-10">
            {view === 'initial' ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 border-2 border-slate-200 hover:border-blue-400 hover:bg-white text-slate-700 transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-blue-100"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-blue-50/50 to-transparent z-0" />

                    <div className="flex items-center justify-center relative z-10">
                      <svg className="mr-3 h-6 w-6 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="font-semibold text-lg group-hover:text-blue-600 transition-colors">Continue with Google</span>
                    </div>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-dashed border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white/50 px-3 text-muted-foreground font-medium tracking-wider backdrop-blur-sm rounded-full">OR</span>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    className="w-full h-14 font-semibold bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden border-2 border-transparent hover:border-primary/50"
                    onClick={() => setView('email')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-center relative z-10">
                      <Mail className="mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                      <span className="text-lg">Continue with Email</span>
                    </div>
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> & <a href="#" className="underline hover:text-primary">Privacy Policy</a>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView('initial')}
                    className="mr-2 -ml-2 hover:bg-slate-100 rounded-full h-10 w-10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
                  </h2>
                </div>

                <div className="bg-slate-100 p-1 rounded-lg grid grid-cols-2 mb-6">
                  <button
                    className={`py-2 rounded-md text-sm font-medium transition-all ${authMode === 'login'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                    onClick={() => setAuthMode('login')}
                    type="button"
                  >
                    Login
                  </button>
                  <button
                    className={`py-2 rounded-md text-sm font-medium transition-all ${authMode === 'signup'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                    onClick={() => setAuthMode('signup')}
                    type="button"
                  >
                    Sign Up
                  </button>
                </div>

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        className="h-11 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot?</a>
                      </div>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        required
                        className="h-11 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me for 30 days</Label>
                    </div>

                    <Button type="submit" className="w-full h-11 text-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        className="h-11 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        required
                        className="h-11 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all"
                      />
                      <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </Label>
                    </div>

                    <Button type="submit" className="w-full h-11 text-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
