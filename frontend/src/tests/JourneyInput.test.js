import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import JourneyInput from "../components/JourneyInput/JourneyInput";
import axios from "axios"
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

// This also mocks the axios usages in the imported files
jest.mock("axios")

beforeEach(() => {
    // return mock data that would otherwise be returned from an API call within the <JourneyInput /> component
    axios.mockImplementation(() => {
        return Promise.resolve({
            data: [
                { "value": "1001002", "label": "Acton Central" },
                { "value": "1001044", "label": "Cambridge Heath" },
                { "value": "1001569", "label": "Haggerston" },
                { "value": "1001250", "label": "Silver Street" },
                { "value": "1000173", "label": "Oxford Circus" },
                { "value": "1000138", "label": "Liverpool Street" },
                { "value": "1000062", "label": "Ealing Broadway" },
                { "value": "1000143", "label": "Mansion House" }
            ]
        })
    })
})

describe("TC1 autocomplete and from and to input", () => {
    test("TC1.1 from select should autocomplete user input 'acton' to 'Acton Central'", async () => {
        // Arrange
        render(<JourneyInput />);

        // gets the <input> element nested within the <Select /> component based on the htmlFor label.
        const fromSelectInput = screen.getByLabelText("From")

        // Wait for the component to render and the API request to complete
        await waitFor(() => {
            expect(fromSelectInput).toBeInTheDocument()
        })

        // Act & Assert
        // simulate user typing "acton"
        fireEvent.change(fromSelectInput, { target: { value: 'acton' } });

        // check if listbox with autocomplete options has opened
        expect(screen.getByRole('listbox')).toBeInTheDocument();

        // check if autocomplete suggestion is shown and click on it
        expect(screen.getByText("Acton Central")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Acton Central"))

        // ensure that listbox is closed after clicking
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

        // check that "Acton Central" is shown in select
        expect(screen.getByText("Acton Central")).toBeInTheDocument();
    })

    test("TC1.2 swap button should swap from and to selections", async () => {
        // Arrange
        render(<JourneyInput />);

        // Wait for the component to render and the API request to complete
        await waitFor(() => {
            expect(screen.getByLabelText("From")).toBeInTheDocument()
        })

        // gets the <input> element nested within the <Select /> component based on the htmlFor label.
        const fromSelectInput = screen.getByLabelText("From")
        const toSelectInput = screen.getByLabelText("To")

        // set From selection
        fireEvent.change(fromSelectInput, { target: { value: "Acton Central" } });
        fireEvent.keyDown(fromSelectInput, { key: "Enter" })
        expect(screen.getByText("Acton Central")).toBeInTheDocument()

        // set To selection
        fireEvent.change(toSelectInput, { target: { value: "Mansion House" } });
        fireEvent.keyDown(toSelectInput, { key: "Enter" })
        expect(screen.getByText("Mansion House")).toBeInTheDocument()

        // Act
        // get the icon by its name and click it
        const swapButton = screen.getByText("swap_horiz")
        act(() => {
            userEvent.click(swapButton);
        });

        // Assert
        // The react-select component puts the selected option in a parent div instead of in the value attribute of the input
        // element. Below is ugly code to target this div and to check if the selected option is swapped.
        const fromSelectTextContent = fromSelectInput.closest("div").previousSibling;
        expect(fromSelectTextContent).toHaveTextContent("Mansion House")

        const toSelectTextContent = toSelectInput.closest("div").previousSibling;
        expect(toSelectTextContent).toHaveTextContent("Acton Central")
    })
})

describe("TC5 datepicker", () => {
    // mock the date to avoid failing tests when they run exactly at the day change.
    const mockedDate = "2023-12-09"

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(mockedDate))
    })

    test("TC5.1 renders correctly", async () => {
        // Arrange
        render(<JourneyInput />)

        await waitFor(() => {
            // Assert
            expect(screen.getByLabelText("Date")).toBeInTheDocument();
        })
    })

    test("TC5.2 sets default date correctly", async () => {
        // Arrange
        render(<JourneyInput />)

        let datePicker
        await waitFor(() => {
            datePicker = screen.getByLabelText("Date")
        })

        // Assert
        expect(datePicker).toHaveValue(mockedDate)
    })

    test("TC5.3 updates date correctly", async () => {
        // Arrange
        render(<JourneyInput />)

        let datePicker
        await waitFor(() => {
            datePicker = screen.getByLabelText("Date")
        })

        // Act
        const updatedDate = "2024-04-04"
        fireEvent.change(datePicker, { target: { value: updatedDate } })

        // Assert
        expect(datePicker).toHaveValue(updatedDate)
    })

    test("TC5.4 defaults to today when date is invalid", async () => {
        // Arrange
        render(<JourneyInput />)

        let datePicker
        await waitFor(() => {
            datePicker = screen.getByLabelText("Date")
        })

        // Act
        // set value to invalid date (non-existing day)
        const invalidDate = "2023-02-30"
        fireEvent.change(datePicker, { target: { value: invalidDate } })

        // Assert
        expect(datePicker).not.toHaveValue(invalidDate)
        expect(datePicker).toHaveValue(mockedDate)
    })
})

describe("TC6 time-picker", () => {
    // mock the date and time to avoid failing tests when they run exactly at the minute change.
    const mockedDate = "2023-12-09"
    const mockedTime = "10:17"

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(`${mockedDate} ${mockedTime}`))
    })

    test("TC6.1 renders correctly", async () => {
        // Arrange
        render(<JourneyInput />)

        await waitFor(() => {
            // Assert
            expect(screen.getByLabelText("Time")).toBeInTheDocument()
        })
    })

    test("TC6.2 sets default time correctly", async () => {
        // Arrange
        render(<JourneyInput />)

        await waitFor(() => {
            // Assert
            expect(screen.getByLabelText("Time")).toHaveValue(mockedTime)
        })
    })

    test("TC6.3 updates time correctly", async () => {
        // Arrange
        render(<JourneyInput />)

        let timePicker
        await waitFor(() => {
            timePicker = screen.getByLabelText("Time")
        })

        // Act
        const updatedTime = "16:57"
        fireEvent.change(timePicker, { target: { value: updatedTime } })

        // Assert
        expect(timePicker).toHaveValue(updatedTime)
    })
})
