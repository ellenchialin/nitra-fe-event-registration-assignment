export default {
  steps: {
    attendee: 'Attendee Info',
    sessions: 'Sessions',
    addons: 'Add-ons',
    review: 'Review',
  },
  step1: {
    ticketTypeTitle: 'Select Ticket Type',
    attendeeTitle: 'Attendee Information',
    selected: 'Selected',
  },
  step2: {
    title: 'Select Sessions',
    selectDay: 'Conference day',
    selectedCount: 'No sessions selected | 1 session selected | {count} sessions selected',
  },
  tracks: {
    main: 'Main',
    frontend: 'Frontend',
    backend: 'Backend',
    devops: 'DevOps',
  },
  capacity: {
    spotsLeft: '{count} spots left',
    soldOut: 'Sold Out',
  },
  fields: {
    fullName: { label: 'Full Name', placeholder: 'Enter your full name' },
    email: { label: 'Email', placeholder: 'Enter your email address' },
    phone: { label: 'Phone', placeholder: 'Enter your phone number' },
    company: { label: 'Company', placeholder: 'Enter your company name' },
    jobTitle: { label: 'Job Title', placeholder: 'Enter your job title' },
    shippingAddress: {
      label: 'Shipping Address',
      labelOptional: 'Shipping Address (Optional)',
      labelRequired: 'Shipping Address *',
      placeholder: 'Enter your shipping address',
      requiredForMerchandise: 'Shipping address is required for merchandise orders',
    },
  },
  nav: {
    back: 'Back',
    next: {
      sessions: 'Next: Session Selection',
      addons: 'Next: Add-ons',
      review: 'Next: Review',
    },
    submit: 'Submit Registration',
  },
  a11y: {
    language: 'Language',
    progress: 'Registration progress',
    stepOf: 'Step {number} of {total}: {label}',
    stepCompleted: 'completed',
    stepHasErrors: 'has errors',
  },
}
