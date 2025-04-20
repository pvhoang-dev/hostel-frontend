import { useState } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const PaymentMethodForm = ({
                               initialData = {},
                               onSubmit,
                               isSubmitting = false,
                               errors = {},
                               mode = "create",
                           }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "active",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                />

                <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    error={errors.status}
                    options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                    ]}
                />

                <div className="md:col-span-2">
                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        error={errors.description}
                        textarea
                        rows={4}
                    />
                </div>
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
                            ? "Create Payment Method"
                            : "Update Payment Method"}
                </Button>
            </div>
        </form>
    );
};

export default PaymentMethodForm;