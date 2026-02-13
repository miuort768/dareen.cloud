import { useEffect } from 'react';

export const MaintenanceScreen = () => {
    useEffect(() => {
        // Force redirect to login-q8 after 1 second if stuck here
        const timer = setTimeout(() => {
            window.location.href = '/login-q8';
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">جاري تحويلك إلى صفحة الدخول...</h1>
            <p className="mb-6">إذا لم يتم تحويلك تلقائياً، اضغط على الزر أدناه:</p>
            <a
                href="/login-q8"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg"
            >
                الدخول للمنصة الآن
            </a>
        </div>
    );
};
