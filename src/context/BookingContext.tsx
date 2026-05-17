import React, { createContext, useContext, useState } from 'react';

interface BookingContextType {
  isOpen: boolean;
  selectedPlan: string | null;
  openModal: (plan?: string) => void;
  closeModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const openModal = (plan?: string) => {
    setSelectedPlan(plan || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedPlan(null);
  };

  return (
    <BookingContext.Provider value={{ isOpen, selectedPlan, openModal, closeModal }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingModal = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingModal must be used within a BookingProvider');
  }
  return context;
};
