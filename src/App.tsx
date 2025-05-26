import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import RsvpForm from "./RsvpForm";
import { PartyPopper, CalendarDays, Clock, MapPin, Users, VenetianMask } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 text-gray-800">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <PartyPopper className="h-8 w-8 text-pink-500" />
          <h2 className="text-xl font-semibold text-pink-600">Marlan & Tramaine's 40th Bash!</h2>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md shadow-xl rounded-lg p-6 sm:p-10">
          <Content />
        </div>
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const myRsvp = useQuery(api.rsvps.getMyRsvp);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
          You're Invited!
        </h1>
        <p className="text-lg text-gray-600 mb-6">Join us to celebrate a fabulous 40th!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <InfoItem icon={<CalendarDays className="text-purple-500" />} label="Date" value="Friday, 18 July 2025" />
        <InfoItem icon={<Clock className="text-purple-500" />} label="Time" value="7:00 PM" />
        <InfoItem icon={<MapPin className="text-purple-500" />} label="Venue" value="The Terrace Rooftop Venue" />
        <InfoItem icon={<VenetianMask className="text-purple-500" />} label="Dress Code" value="Cocktail Attire" />
      </div>
      
      <div className="text-center mt-4 p-4 border border-purple-300 rounded-lg bg-purple-50">
        <h3 className="text-lg font-semibold text-purple-700 mb-1">RSVP By: 9 June 2025</h3>
        <p className="text-sm text-gray-600">
          Tramaine: <a href="tel:0765080013" className="text-pink-500 hover:underline">0765080013</a> | Marlan: <a href="tel:0844022107" className="text-pink-500 hover:underline">0844022107</a>
        </p>
      </div>

      <Unauthenticated>
        <div className="mt-6">
          <p className="text-center text-lg text-gray-700 mb-4">Please sign in to RSVP:</p>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {loggedInUser && (
          <div className="mt-6">
            {myRsvp === undefined && <div className="text-center">Loading RSVP status...</div>}
            {myRsvp && (
               <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg">
                <h3 className="text-xl font-semibold text-green-700">Thanks for RSVPing, {myRsvp.name}!</h3>
                <p className="text-green-600">We've got your details. You can update your RSVP below if needed.</p>
              </div>
            )}
             <RsvpForm userEmail={loggedInUser.email ?? ""} currentRsvp={myRsvp} />
          </div>
        )}
      </Authenticated>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md shadow-sm">
      <span className="flex-shrink-0 w-6 h-6 mt-1">{icon}</span>
      <div>
        <h3 className="font-semibold text-gray-700">{label}</h3>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
}
