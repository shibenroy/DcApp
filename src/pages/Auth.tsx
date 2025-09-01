import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Mail, Lock, User, Phone, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [authMode, setAuthMode] = useState<"student" | "teacher" | "participant">("student");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    studentId: "",
    grade: "",
    section: "",
    phone: ""
  });

  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup && (authMode === "student" || authMode === "participant")) {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // Sign up student or participant with profile data
        const { error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          student_id: authMode === "student" ? formData.studentId : undefined,
          grade: authMode === "student" ? formData.grade : undefined,
          section: authMode === "student" ? formData.section : undefined,
          phone: formData.phone,
          role: authMode // "student" or "participant"
        });

        if (!error) {
          // Don't navigate immediately - user needs to verify email
        }
      } else {
        // Sign in (all roles)
        const { error } = await signIn(formData.email, formData.password);
        
        if (!error) {
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            EduSync
          </h1>
          <p className="text-muted-foreground">
            Access your school events platform
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex gap-2">
          <Button
            variant={authMode === "student" ? "default" : "outline"}
            onClick={() => setAuthMode("student")}
            className="flex-1"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Student
          </Button>
          <Button
            variant={authMode === "teacher" ? "default" : "outline"}
            onClick={() => setAuthMode("teacher")}
            className="flex-1"
          >
            <Users className="mr-2 h-4 w-4" />
            Teacher
          </Button>
          <Button
            variant={authMode === "participant" ? "default" : "outline"}
            onClick={() => setAuthMode("participant")}
            className="flex-1"
          >
            <User className="mr-2 h-4 w-4" />
            Participant
          </Button>
        </div>

        {/* Auth Forms */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {authMode === "student" ? (
                <GraduationCap className="h-5 w-5 text-primary" />
              ) : authMode === "teacher" ? (
                <Users className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
              {authMode === "student"
                ? "Student Access"
                : authMode === "teacher"
                ? "Teacher Portal"
                : "Participant Portal"}
            </CardTitle>
            <CardDescription>
              {authMode === "student"
                ? "Register or sign in to manage your event registrations"
                : authMode === "teacher"
                ? "Sign in to manage school events and view analytics"
                : "Sign in or sign up to participate in school events"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={isSignup ? "signup" : "signin"} onValueChange={(value) => setIsSignup(value === "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup" disabled={authMode === "teacher"}>
                  {authMode === "teacher" ? "Teachers Only Sign In" : "Sign Up"}
                </TabsTrigger>
              </TabsList>

              {/* Sign In Form */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={
                          authMode === "student"
                            ? "Enter your student email"
                            : authMode === "teacher"
                            ? "Enter your teacher email"
                            : "Enter your participant email"
                        }
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                   <Button type="submit" className="w-full" disabled={loading}>
                     {loading
                       ? "Signing In..."
                       : `Sign In as ${
                           authMode === "student"
                             ? "Student"
                             : authMode === "teacher"
                             ? "Teacher"
                             : "Participant"
                         }`}
                   </Button>

                  <div className="text-center">
                    <Button variant="link" className="text-sm text-muted-foreground">
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Sign Up Form */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Info (All Users) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                         <Input
                           id="firstName"
                           placeholder="First name"
                           className="pl-10"
                           value={formData.firstName}
                           onChange={(e) => handleInputChange("firstName", e.target.value)}
                           required
                         />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                       <Input
                         id="lastName"
                         placeholder="Last name"
                         value={formData.lastName}
                         onChange={(e) => handleInputChange("lastName", e.target.value)}
                         required
                       />
                    </div>
                  </div>

                  {/* Email & Phone fields */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                       <Input
                         id="email"
                         type="email"
                         placeholder="student@school.edu"
                         className="pl-10"
                         value={formData.email}
                         onChange={(e) => handleInputChange("email", e.target.value)}
                         required
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                       <Input
                         id="phone"
                         type="tel"
                         placeholder="Your phone number"
                         className="pl-10"
                         value={formData.phone}
                         onChange={(e) => handleInputChange("phone", e.target.value)}
                         required
                       />
                    </div>
                  </div>

                  {/* Student-specific fields */}
                  {authMode === "student" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <div className="relative">
                          <Badge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0" />
                           <Input
                             id="studentId"
                             placeholder="Enter your student ID"
                             className="pl-10"
                             value={formData.studentId}
                             onChange={(e) => handleInputChange("studentId", e.target.value)}
                             required
                           />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="grade">Grade</Label>
                           <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)} required>
                             <SelectTrigger>
                               <SelectValue placeholder="Select grade" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="9">Grade 9</SelectItem>
                               <SelectItem value="10">Grade 10</SelectItem>
                               <SelectItem value="11">Grade 11</SelectItem>
                               <SelectItem value="12">Grade 12</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="section">Section</Label>
                           <Select value={formData.section} onValueChange={(value) => handleInputChange("section", value)} required>
                             <SelectTrigger>
                               <SelectValue placeholder="Section" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="A">Section A</SelectItem>
                               <SelectItem value="B">Section B</SelectItem>
                               <SelectItem value="C">Section C</SelectItem>
                               <SelectItem value="D">Section D</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Password fields */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                       <Input
                         id="password"
                         type="password"
                         placeholder="Create a password"
                         className="pl-10"
                         value={formData.password}
                         onChange={(e) => handleInputChange("password", e.target.value)}
                         required
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                       <Input
                         id="confirmPassword"
                         type="password"
                         placeholder="Confirm your password"
                         className="pl-10"
                         value={formData.confirmPassword}
                         onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                         required
                       />
                    </div>
                  </div>

                   <Button type="submit" className="w-full" disabled={loading}>
                     {loading ? "Creating Account..." : `Create ${authMode.charAt(0).toUpperCase() + authMode.slice(1)} Account`}
                   </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By signing up, you agree to our terms of service and privacy policy
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card className="bg-gradient-subtle border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Authentication System Active
                </p>
                <p className="text-xs text-muted-foreground">
                  Full authentication with user profiles, email verification, and secure session management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}