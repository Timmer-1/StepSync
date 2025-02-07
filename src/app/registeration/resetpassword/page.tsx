import GridBackground from "@/app/ui/background"

export default function ResetPassword () {
   return (
   <GridBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-400 rounded-full" />
            </div>
            <h2 className="text-2xl font-bold">Reset Password</h2>
            <p className="text-gray-400 mt-2">Please enter your email to reset your password.</p>
          </div>
        </div>
        </div>
    </GridBackground>
);
}