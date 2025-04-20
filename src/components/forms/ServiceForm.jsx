import { useState } from "react";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";

const ServiceForm = ({
                         initialData = {},
                         onSubmit,
                         isSubmitting = false,
                         errors = {},
                         mode = "create",
                     }) => {
    const [formData, setFormData] = useState({
        name: "",
        default_price: "",
        unit: "",
        is_metered: false,
        ...initialData,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert is_metered back to 0/1 if needed by API, or keep boolean
        // Assuming API expects boolean or 0/1 based on controller validation 'sometimes|boolean'
        const dataToSubmit = {
            ...formData,
            // Convert boolean to integer 0 or 1 if your backend expects that
            // is_metered: formData.is_metered ? 1 : 0,
        };
        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Service Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                />

                <Input
                    label="Default Price"
                    name="default_price"
                    type="number" // Use number type for price
                    value={formData.default_price}
                    onChange={handleChange}
                    error={errors.default_price}
                    required
                />

                <Input
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    error={errors.unit}
                    required
                />

                <div className="flex items-center space-x-2 md:col-span-2">
                    <input
                        type="checkbox"
                        id="is_metered"
                        name="is_metered"
                        checked={formData.is_metered}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_metered" className="text-sm font-medium text-gray-700">
                        Is Metered? (e.g., Electricity, Water)
                    </label>
                    {errors.is_metered && <p className="text-red-500 text-xs mt-1">{errors.is_metered}</p>}
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
                            ? "Create Service"
                            : "Update Service"}
                </Button>
            </div>
        </form>
    );
};

export default ServiceForm;