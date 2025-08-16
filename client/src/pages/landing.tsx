import { GraduationCap, Users, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">EduManage</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Complete School
              <span className="text-gradient block">Management System</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your educational institution with our comprehensive platform for 
              administrators, teachers, and parents. Manage students, track attendance, 
              handle fees, and enhance communication all in one place.
            </p>
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-primary text-white px-8 py-3 text-lg"
              data-testid="button-get-started"
            >
              Get Started Today
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Everything You Need to Manage Your School
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card data-testid="card-feature-admin">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Portal</h3>
                  <p className="text-gray-600">
                    Complete administrative control with teacher management, class creation, 
                    fee structure, and comprehensive reporting.
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-feature-teacher">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Teacher Tools</h3>
                  <p className="text-gray-600">
                    Manage students, create assignments, track attendance, 
                    generate progress reports, and communicate with parents.
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-feature-parent">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Parent Access</h3>
                  <p className="text-gray-600">
                    Monitor child's progress, view attendance, make fee payments, 
                    and stay connected with teachers and school updates.
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-feature-communication">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-6 w-6 text-warning" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Communication</h3>
                  <p className="text-gray-600">
                    Seamless communication between administrators, teachers, 
                    and parents with notifications and messaging.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Choose EduManage?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-4"></div>
                    <p className="text-gray-600">
                      <strong>Role-based Access:</strong> Customized dashboards for administrators, 
                      teachers, and parents with appropriate permissions and features.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-4"></div>
                    <p className="text-gray-600">
                      <strong>Comprehensive Management:</strong> Handle everything from student 
                      enrollment to fee collection, attendance tracking, and academic progress.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-4"></div>
                    <p className="text-gray-600">
                      <strong>Real-time Updates:</strong> Instant notifications and updates 
                      keep everyone informed about important school activities and announcements.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-4"></div>
                    <p className="text-gray-600">
                      <strong>Secure & Reliable:</strong> Built with modern security practices 
                      to protect sensitive student and school data.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of educational institutions already using EduManage 
                  to streamline their operations and improve communication.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-gradient-primary text-white"
                  data-testid="button-start-free"
                >
                  Start Your Free Trial
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h3 className="ml-3 text-xl font-bold">EduManage</h3>
            </div>
            <p className="text-gray-400">
              © 2024 EduManage. Empowering educational institutions worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
