import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import JourneyTimeline from '../components/JourneyOutput/JourneyComponents/JourneyTimeline';

describe('TC12 JourneyTimeline', () => {
    // Mocking necessary props for testing
    const mockProps = {
        minutesToTime: jest.fn(),
        extractTime: jest.fn(),
        journeyView: {
            duration: 79,
            legs: [
                {
                    departureTime: '2023-12-01T12:00:00',
                    mode: { id: 'walking' },
                    departurePoint: { commonName: 'Start walking Station' },
                    instruction: { detailed: 'Start walking' },
                    duration: 20,
                    arrivalTime: '2023-12-01T12:10:00',
                    arrivalPoint: { commonName: 'Destination walking Station' },
                },
                {
                    departureTime: '2023-12-01T12:00:00',
                    departurePoint: { commonName: 'Start Station' },
                    duration: 10,
                    path: { stopPoints: [{ name: 'Stop1' }, { name: 'Stop2' }, { name: 'Stop3' }], },
                    disruptions: [{ description: 'Disruption 1' }, { description: 'Disruption 2' }],
                    arrivalTime: '2023-12-01T12:10:00',
                    arrivalPoint: { commonName: 'Destination Station' },
                }
            ],
        },
    };

    test('TC12.1 renders JourneyTimeline component checking', () => {
        // Arrange: Render the JourneyTimeline component with mockProps
        render(<JourneyTimeline {...mockProps} />);

        // Act: Retrieve elements by text for assertions
        const startElement = screen.getByText('Start');
        const destinationElement = screen.getByText('Destination');
        const walkingArrivalElement = screen.getByText('Destination walking Station');
        const walkingStartElement = screen.getByText('Start walking Station');
        const tubeStartElement = screen.getByText('Start Station');
        const tubeArrivalElement = screen.getByText('Destination Station');
        const walkingDuration = screen.getByText('20 min');
        const tubeDuration = screen.getByText('10 min');

        // Assert: Check if each element is in the document
        expect(startElement).toBeInTheDocument();
        expect(destinationElement).toBeInTheDocument();
        expect(walkingStartElement).toBeInTheDocument();
        expect(walkingArrivalElement).toBeInTheDocument();
        expect(tubeStartElement).toBeInTheDocument();
        expect(tubeArrivalElement).toBeInTheDocument();
        expect(walkingDuration).toBeInTheDocument();
        expect(tubeDuration).toBeInTheDocument();
    });

    test('TC12.2 toggles View/Hide stops visibility on click', () => {
        // Arrange: Render the JourneyTimeline component with mockProps
        render(<JourneyTimeline {...mockProps} />);

        // Act: Simulate a user clicking the "View stops" button
        const viewStopsButton = screen.getByText('View stops');
        fireEvent.click(viewStopsButton);

        // Assert: Check if stops are visible after clicking "View stops"
        const stopOne = screen.getByText('Stop1');
        const stopTwo = screen.getByText('Stop2');
        expect(stopOne).toBeInTheDocument();
        expect(stopTwo).toBeInTheDocument();

        // Act: Simulate a user clicking the "Hide stops" button
        const hideStopsButton = screen.getByText('Hide stops');
        fireEvent.click(hideStopsButton);

        // Assert: Check if stops are not in the document after clicking "Hide stops"
        expect(stopOne).not.toBeInTheDocument();
        expect(stopTwo).not.toBeInTheDocument();
    });

    test('TC12.3 toggles View/Hide disruptions visibility on click', () => {
        // Arrange: Render the JourneyTimeline component with mockProps
        render(<JourneyTimeline {...mockProps} />);

        // Act: Simulate a user clicking the "View disruptions" button
        const viewDisruptionsButton = screen.getByText('View disruptions');
        fireEvent.click(viewDisruptionsButton);

        // Assert: Check if disruptions are visible after clicking "View disruptions"
        const disruptionOne = screen.getByText('Disruption 1');
        const disruptionTwo = screen.getByText('Disruption 2');
        expect(disruptionOne).toBeInTheDocument();
        expect(disruptionTwo).toBeInTheDocument();

        // Act: Simulate a user clicking the "Hide disruptions" button
        const hideDisruptionsButton = screen.getByText('Hide disruptions');
        fireEvent.click(hideDisruptionsButton);

        // Assert: Check if disruptions are not in the document after clicking "Hide disruptions"
        expect(disruptionOne).not.toBeInTheDocument();
        expect(disruptionTwo).not.toBeInTheDocument();
    });
});
