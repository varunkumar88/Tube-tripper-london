import { fireEvent, render, screen } from "@testing-library/react";
import Toggle from "../components/JourneyInput/Toggle";

describe("TC7 toggle", () => {
    test("TC7.1 switches time to departure or arrival time", () => {
        // Arrange
        render(<Toggle
            name="isArrivalTime"
            leftLabel="Departure"
            rightLabel="Arrival"
            checked={false}
            onChange={jest.fn()}
        />)

        const toggle = screen.getByRole("checkbox")
        expect(toggle).toHaveProperty("checked", false)

        // Act
        // simulate user clicking toggle
        fireEvent.click(toggle)
        fireEvent.change(toggle, { target: { checked: true } })

        // Assert
        expect(toggle).toHaveProperty("checked", true)
    })
})
