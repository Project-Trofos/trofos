import { render, screen } from "@testing-library/react";
import React from "react";
import NewPasswordFormItem from "./NewPasswordFormItem";
import FormWrapper from "./__testutils__/FormRenderHelper.test";

describe("NewPasswordFormItem test", () => {
    function renderForm() {
        return render(
            <FormWrapper>
                <NewPasswordFormItem />
            </FormWrapper>
        )
    }

    describe('when rendering', () => {
        it('should have a field for the new password and for its confirmation', () => {
            const { baseElement } = renderForm();
            expect(baseElement).toMatchSnapshot();

            expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
        })
    })
})