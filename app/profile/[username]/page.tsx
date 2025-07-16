import ProfileView from "@/components/profile/profile-view"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileView username={params.username} />
    </div>
  )
}
