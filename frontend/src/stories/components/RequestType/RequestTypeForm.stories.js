import RequestTypeForm from "main/components/RequestType/RequestTypeForm";

export default {
  title: "components/RequestType/RequestTypeForm",
  component: RequestTypeForm,
};

const Template = (args) => <RequestTypeForm {...args} />;

export const Default = Template.bind({});
Default.args = {
  submitAction: (data) => console.log("Submitted data:", data),
  buttonLabel: "Create",
};
