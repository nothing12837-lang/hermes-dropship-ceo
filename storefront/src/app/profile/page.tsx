import { ProfileClient } from './ProfileClient';

export const metadata = {
  title: 'Your Account Profile',
  description: 'View your order history.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
