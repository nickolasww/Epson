import { LoadingOutlined } from '@ant-design/icons';

/**
 * Spinner component - Flexible loading indicator
 * @param size - Size of the spinner: 'small' (16px), 'default' (24px), 'large' (48px)
 * @param color - Custom color (default: brand green #48892F)
 */
interface SpinnerProps {
  size?: 'small' | 'default' | 'large';
  color?: string;
}

export function Spinner({ size = 'default', color = '#48892F' }: SpinnerProps) {
  const sizeMap = {
    small: 16,
    default: 24,
    large: 48
  };
  
  return (
    <LoadingOutlined 
      style={{ 
        fontSize: sizeMap[size],
        color: color
      }} 
      spin 
    />
  );
}

/**
 * LoadingPage - Full screen loading page
 */
export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner size="large" />
        <p className="text-lg text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  );
}
