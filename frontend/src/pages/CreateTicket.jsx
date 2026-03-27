import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../api/axios";

const CreateTicket = () => {
    const navigate = useNavigate();

    // 🔹 Validation Schema
    const TicketSchema = Yup.object().shape({
        title: Yup.string()
            .min(3, "Too short")
            .required("Title is required"),

        description: Yup.string()
            .min(5, "Too short")
            .required("Description is required"),

        priority: Yup.string()
            .oneOf(["Low", "Medium", "High"], "Invalid priority")
            .required("Priority is required"),
    });

    return (
        <div className="flex justify-center items-center bg-gray-100 text-gray-900">
            <div className="bg-white  shadow-lg rounded-xl px-6 pt-3 pb-4 w-full max-w-lg">
                <h2 className="text-2xl  font-semibold mb-3 text-center">
                    Create Ticket
                </h2>
                <Formik
                    initialValues={{
                        title: "",
                        description: "",
                        priority: "Low",
                    }}
                    validationSchema={TicketSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            await API.post("/tickets", values);
                            alert("Ticket was created!")
                            navigate("/dashboard");
                        } catch (err) {
                            console.error(err);
                            alert("Failed to create ticket");
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-2">

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Title
                                </label>
                                <Field
                                    name="title"
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <p className="text-red-500 text-xs">
                                    <ErrorMessage name="title" />
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <Field
                                    as="textarea"
                                    name="description"
                                    rows="4"
                                    
                                    className="w-full border rounded-lg resize-none p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <p className="text-red-500 text-xs">
                                    <ErrorMessage name="description" />
                                </p>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Priority
                                </label>
                                <Field
                                    as="select"
                                    name="priority"
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </Field>
                                <p className="text-red-500 text-sm">
                                    <ErrorMessage name="priority" />
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {isSubmitting ? "Creating..." : "Create Ticket"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CreateTicket;