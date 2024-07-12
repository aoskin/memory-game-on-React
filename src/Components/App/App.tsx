import React, { useState, useEffect } from 'react';
import './App.css';
import { Card } from '../Card/Card';
import { Counter } from '../Counter/Counter';
import { Modal } from '../Modal/Modal'
import { getNoun, getInitialCards } from '../../utils'

interface Card {
  id: number,
  isOpen: boolean,
  isSolved: boolean,
  img: string
  name: string
}

export const App = () => {
  const [step, setStep] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [openCardsTimeout, setOpenCardsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [areCardsClickable, setAreCardsClickable] = useState(true);
  const numberOfAttempts = 40;

  const handleCardClick = (id: number) => {
    if (!areCardsClickable) {
      return;
    }

    const updatedCards = cards.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isOpen: true
        };
      }
      return item;
    });

    setCards(updatedCards);

    const openCards = updatedCards.filter((item) => item.isOpen && !item.isSolved);
    const remainingAttempts = numberOfAttempts - (step + 1);
    if (openCards.length === 2) {
      setStep((prevStep) => prevStep + 1);

      if (openCards[0].name === openCards[1].name) {
        const updatedMatchedCards = updatedCards.map((item) => {
          if (item.isOpen && !item.isSolved) {
            return {
              ...item,
              isSolved: true,
            };
          }
          return item;
        });

        setCards(updatedMatchedCards);
      } else {
        const openCardsTimeout = setTimeout(() => {
          const updatedClosedCards = updatedCards.map((item) => {
            if (item.isOpen && !item.isSolved) {
              return {
                ...item,
                isOpen: false,
              };
            }
            return item;
          });

          setCards(updatedClosedCards);
        }, 1500);

        setOpenCardsTimeout(openCardsTimeout);
      }
    } else if (openCards.length === 3) {
      if (openCardsTimeout) {
        clearTimeout(openCardsTimeout);
      }

      const updatedClosedCards = updatedCards.map((item) => {
        if (item.isOpen && !item.isSolved) {
          return {
            ...item,
            isOpen: false,
          };
        }
        return item;
      });

      setCards(updatedClosedCards);

      const updatedCardClicked = updatedClosedCards.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            isOpen: true,
          };
        }
        return item;
      });

      setCards(updatedCardClicked);
    }
  };

  useEffect(() => {
    const initialCards = getInitialCards();
    setCards(initialCards);
  }, []);

  useEffect(() => {
    const remainingAttempts = numberOfAttempts - step;

    if (step >= numberOfAttempts) {
      setTitle('УВЫ, ВЫ ПРОИГРАЛИ');
      setDescription('К сожалению, у вас закончились попытки.');
      setModalShow(true);
      setAreCardsClickable(false);
    } else if (remainingAttempts > 0 && cards.length > 0 && cards.every((item) => item.isSolved)) {
      setTitle('Ура, ВЫ выиграли!');
      setDescription(`Это заняло ${step} ${getNoun(step, 'ход', 'хода', 'ходов')}.`);
      setModalShow(true);
      setAreCardsClickable(false);
    }
  }, [step, cards]);

  const restartGame = () => {
    setStep(0);
    setCards(getInitialCards);
    setOpenCardsTimeout(null);
    setTitle('');
    setDescription('');
    setModalShow(false);
    setAreCardsClickable(true);
  };

  return (
    <React.Fragment>
      <main>
        <h1>MEMORY</h1>
        <div className="memory">
          <Counter text='Сделано ходов' value={step} />
          <div className="memory__cards">
            {cards.map((item) => {
              return (
                <Card
                  id={0}
                  key={item.id}
                  isOpen={item.isOpen}
                  isSolved={item.isSolved}
                  imgSrc={item.img}
                  name={item.name}
                  onClick={() => handleCardClick(item.id)}  />
              );
            })}
          </div>
          <Counter text='Осталось попыток' value={numberOfAttempts - step} />
          <Modal 
          title={title} 
          description={description} 
          modalShow={modalShow} 
          isOver={step >= numberOfAttempts} 
          onClick={restartGame}
          />
        </div>
      </main>
    </React.Fragment>
  );
};

