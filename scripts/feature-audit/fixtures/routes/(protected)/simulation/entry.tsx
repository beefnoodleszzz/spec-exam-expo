import { router } from 'expo-router';
import { Link } from 'expo-router';

export default function Entry() {
  const go = () => {
    router.push('/(protected)/simulation/exam');
  };
  return (
    <Link href="/(public)/login">Login</Link>
  );
}
