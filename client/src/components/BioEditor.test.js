import BioEditor from "./BioEditor";
import { render, fireEvent, waitFor } from "@testing-library/react";

test("when no bio is passed to BioEditor an Add button is rendered", () => {
    const { container } = render(<BioEditor />);

    expect(container.querySelector("button").innerHTML).toContain("Add bio");
});

test("when a bio is passed to BioEditor an Edit button is rendered", () => {
    const { container } = render(<BioEditor bio="Test bio" />);

    expect(container.querySelector("button").innerHTML).toContain("Edit bio");
});

test("Clicking the Add or Edit button causes a textarea and a Save button to be rendered", () => {
    const { container } = render(<BioEditor />);

    fireEvent.click(container.querySelector("button"));

    //option 1 : working with Cancel as value instead of Save because this is the default of my button - test passes
    // expect(container.querySelector("button").innerHTML).toContain("Cancel");

    //option 2: simulating a change in textarea
    fireEvent.change(container.querySelector("textarea"), {
        target: { value: "This is a new bio" },
    });

    expect(container.querySelector("button").innerHTML).toContain("Save");
    expect(container.querySelector("textarea")).toBeTruthy();
});

//Clicking the "Save" button causes an HTTP request. The request should not actually happen during the test - Jest has been configured to automatically use a mock of fetch.

test("clicking Save causes HTTP request that changes the bio via the function that was passed down as prop to BioEditor -  mock fetch is pre-set in the Jest configuration", async () => {
    let newBio = "This is a new bio";
    const saveDraftBioToApp = jest.fn();

    fetch.mockResolvedValue({
        async json() {
            return {
                bio: newBio,
            };
        },
    });

    //always place the render after the fetch
    const { container } = render(
        <BioEditor saveDraftBioToApp={saveDraftBioToApp} bio="" />
    );
    fireEvent.click(container.querySelector("button#add"));

    await waitFor(() =>
        expect(container.querySelector("textarea")).toBeTruthy()
    );

    fireEvent.change(container.querySelector("textarea"), {
        target: { value: newBio },
    });

    await waitFor(() =>
        expect(container.querySelector("button").innerHTML).toContain("Save")
    );

    fireEvent.click(container.querySelector("button#save"));

    await waitFor(() =>
        expect(container.querySelector("textarea")).toBeFalsy()
    );

    expect(saveDraftBioToApp).toHaveBeenCalledWith(newBio);
});
