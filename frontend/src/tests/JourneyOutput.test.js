import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JourneyOutput from '../components/JourneyOutput/JourneyOutput.jsx';

// Mock the JourneyTimeline component, assuming it doesn't have specific logic to test here
jest.mock('../components/JourneyOutput/JourneyComponents/JourneyTimeline', () => () => <div></div>);

describe('TC4 JourneyOutput', () => {
    let journeysDataMock;

    beforeEach(() => {
        journeysDataMock = {
            journeys: [
                {
                    startDateTime: '2023-12-03T12:34:56',
                    arrivalDateTime: '2023-12-03T15:45:00',
                    duration: 180,
                    legs: [],
                    fare: { totalCost: 1500 },
                }, {
                    startDateTime: '2023-12-03T10:15:00',
                    arrivalDateTime: '2023-12-03T13:30:00',
                    duration: 180,
                    legs: [],
                    fare: { totalCost: 1500 },
                },
                {
                    startDateTime: '2023-12-03T10:15:00',
                    arrivalDateTime: '2023-12-03T13:30:00',
                    duration: 180,
                    legs: [],
                    fare: { totalCost: 1500 },
                }

            ],
        };
    });

    afterEach(() => {
        // Cleanup after each test, if necessary
        jest.clearAllMocks();
    });

    test('TC4.1 renders JourneyOutput with correct date and time', () => {
        // Arrange
        render(<JourneyOutput journeysData={journeysDataMock} />);

        // Act
        const dateElement = screen.getAllByText("Sunday 3 December 2023");
        const timeElement = screen.getAllByText(/12:34.*15:45/i);
        const timeElementDifference = screen.getAllByText("03:00");

        // Assert
        expect(dateElement[0]).toBeInTheDocument();
        expect(timeElement[0]).toBeInTheDocument();
        expect(timeElementDifference[0]).toBeInTheDocument();
    });

    test('TC4.2 renders journey options with transfer and with price', async () => {
        // Arrange
        render(<JourneyOutput journeysData={journeysDataMock} />);

        // Act
        const transfers = screen.getAllByText("0X");
        const costElement = screen.getAllByText("£15.00");

        // Assert
        expect(transfers[0]).toBeInTheDocument();
        expect(costElement[0]).toBeInTheDocument();
    });

    test('TC4.3 select different journey options', () => {
        // Arrange
        const { container } = render(<JourneyOutput journeysData={journeysDataMock} />);

        // Act
        // Initially, the first journey should have the "border-primary" class
        const initialActiveJourney = container.querySelector('.border-primary');

        // Assert
        expect(initialActiveJourney).toBeInTheDocument();

        // Act 
        //simulate clicking on the second journey
        const inactiveJourney = container.querySelector('.pointer:not(.border-primary)')
        fireEvent.click(inactiveJourney);

        // Assert
        // Now, the second journey should have the "border-primary" class
        expect(inactiveJourney).toHaveClass('border-primary');
        expect(initialActiveJourney).not.toHaveClass('border-primary')
    });
});
