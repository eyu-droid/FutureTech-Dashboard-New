export interface personalDetail {
    entry_id:string;
    fullName:string;
    email:string;
    phoneNo:string;
}
export interface SubmissionResponse{
    registerAs:string;
    registeredDate:Date;
    companyName:string;
    companyProfile:string;
    address: string;
    companyWebsite:string;
    areaOfInterest:string;
    passport:string;
    sponsorshipTier:string;
    interestType:string;
    pitchProduct:string;
    b2Schedule:string;
    
}

export type LocalCompanySubmission = Omit<SubmissionResponse, 'sponsorshipTier' | 'interestType' | 'pitchProduct' | 'b2Schedule' | 'passport'> & personalDetail &{
    companyLicense:string;
    sponserShip:string;
    directoryList:string;
    interest:string;
    numberOfAttendee:number;
}

export type Partners = Omit<personalDetail ,'entry_id'> & Pick<SubmissionResponse, 'companyName'> &{
    id:string;
    interest:string;

}

export type InternationalCompaniesSubmission = Omit<SubmissionResponse, 'registerAs'> & personalDetail

export type NGOSubmission = Pick<SubmissionResponse, 'registeredDate'> & personalDetail & {
    orgName:string;
    requestSpeaking:string;
    collaborate:string;
    orgFile:string;
    mission:string;
    
}

export type EmbassySubmission = personalDetail & Pick<SubmissionResponse, 'passport' | 'address' | 'registeredDate'> &{
    embassy:string;
    requestBilateral:string;
    attendPolicy:string;
    anyDelegation: string;
    numDelegation:string;
}

export type StartupSubmissions = Pick<SubmissionResponse, 'registeredDate'> & personalDetail &{
    startupName:string;
    industry:string;
    govId:string;
    booth:string;
    reqMentorship:string;
    socialWebsite:string;
    stage:string;
    pitchdeck:string;
    appliedPegasus:string;

}

export type EventAttendeeSubmission = personalDetail & Pick<SubmissionResponse, 'registeredDate'> & {
    sectorOfInterest: string;
    ticketType: string;
}

export type ConferenceAttendeeSubmission = EventAttendeeSubmission & {
    workshop:string;
    profession: string;
    investmentOpportunity: string;
    other:string;
}

