import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardData {
  id: string;
  title: string;
  content: React.ReactNode;
  color: string;
}

interface CardStackProps {
  cards: CardData[];
  onCardChange?: (cardId: string) => void;
}

export default function CardStack({ cards, onCardChange }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % cards.length;
    setCurrentIndex(nextIndex);
    onCardChange?.(cards[nextIndex].id);
    console.log(`Card stack navigated to: ${cards[nextIndex].title}`);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
    setCurrentIndex(prevIndex);
    onCardChange?.(cards[prevIndex].id);
    console.log(`Card stack navigated to: ${cards[prevIndex].title}`);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaX = currentX.current - startX.current;
    const threshold = 50;
    
    if (deltaX > threshold) {
      handlePrev();
    } else if (deltaX < -threshold) {
      handleNext();
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card stack container */}
      <div className="relative h-96 perspective-1000">
        {cards.map((card, index) => {
          const offset = index - currentIndex;
          const isVisible = Math.abs(offset) <= 2;
          
          return (
            <Card
              key={card.id}
              className={`absolute inset-0 transition-all duration-500 ease-out cursor-pointer ${
                isVisible ? 'opacity-100' : 'opacity-0'
              } ${card.color}`}
              style={{
                transform: `
                  translateX(${offset * 10}px)
                  translateY(${Math.abs(offset) * 5}px)
                  scale(${1 - Math.abs(offset) * 0.05})
                  rotateY(${offset * -5}deg)
                `,
                zIndex: cards.length - Math.abs(offset)
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => {
                if (offset !== 0) {
                  setCurrentIndex(index);
                  onCardChange?.(card.id);
                }
              }}
              data-testid={`card-stack-item-${card.id}`}
            >
              <div className="p-6 h-full flex flex-col">
                <h3 className="font-display text-xl font-bold mb-4 text-foreground">
                  {card.title}
                </h3>
                <div className="flex-1">
                  {card.content}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Navigation controls */}
      <div className="flex justify-center items-center mt-6 gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="hover-elevate"
          data-testid="button-card-stack-prev"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {/* Card indicators */}
        <div className="flex gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
              onClick={() => {
                setCurrentIndex(index);
                onCardChange?.(cards[index].id);
              }}
              data-testid={`indicator-card-${index}`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="hover-elevate"
          data-testid="button-card-stack-next"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}