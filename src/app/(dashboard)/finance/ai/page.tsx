'use client';

import DepartmentChat from '@/components/department-chat/DepartmentChat';

export default function FinanceAIPage() {
  return (
    <div className="animate-fade-in">
      <DepartmentChat
        department="finance"
        title="FinanceAdvisor AI"
        subtitle="Investment, banking, tax & Islamic finance expert"
        avatar="📈"
        avatarColor="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
        suggestions={[
          'Pakistan Stock Exchange kya hai aur kaise start karoon?',
          'Meezan Bank me savings account kholna chahta hoon',
          'FBR tax return kaise file karoon? NTN kaise banaye?',
          'Islamic banking vs conventional banking — konsa behtar hai?',
          'Halal investment options in Pakistan?',
          'Remittance bhejni hai UK se Pakistan — best option?',
          'Mutual funds vs National Savings — kisme invest karoon?',
          'Mera salary 150K hai, kitna tax lagega?',
          'Takaful insurance kya hai? konsa company best hai?',
          'Retirement planning — VPS kya hai aur tax credit kaise milega?',
        ]}
      />
    </div>
  );
}
