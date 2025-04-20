import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

const EquipmentForm = ({
                           initialData = {},
                           onSubmit,
                           isSubmitting = false,
                           errors = {},
                           mode = "create",
                       }) => {
    const [formData, setFormData] = useState({
        name: "",
        ...initialData,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
                <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                />
            </div>

            <div className="mt-6 flex justify-end">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => window.history.back()}
                    className="mr-2"
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? `${mode === "create" ? "Creating" : "Updating"}...`
                        : mode === "create"
                            ? "Create Equipment"
                            : "Update Equipment"}
                </Button>
            </div>
        </form>
    );
};

export default EquipmentForm;