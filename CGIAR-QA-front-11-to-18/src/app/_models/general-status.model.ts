export enum DetailedStatus {
    Complete = 'complete',
    Pending = 'pending',
    Finalized = 'finalized',
    Autochecked = 'autochecked'
}
export enum GeneralStatus {
    Open = 'open',
    Close = 'close'
}

export enum GeneralIndicatorName {
    qa_impact_contribution = 'Impact Contribution',
    qa_other_outcome = 'Other Outcome',
    qa_other_output = 'Other Output',
    qa_capdev = 'Cap Sharing',
    qa_knowledge_product = 'Knowledge Product',
    qa_innovation_development = 'Innovation Development',
    qa_policy_change = 'Policy Change',
    qa_innovation_use = 'Innovation Use',
    qa_innovation_use_ipsr = 'Innovation Use (IPSR)'
}

export enum IndicatorsID {
    impact_contribution = 1,
    capacity_change = 2,
    other_outcome = 3,
    other_output = 4,
    capdev = 5,
    knowledge_product = 6, 
    innovation_development = 7, 
    policy_change = 8,
    innovation_use = 9, 
    qa_innovation_use_ipsr = 10
}

export enum TagMessage {
    agree = 'agrees with a comment in',
    disagree = 'disagrees with a comment in',
    notsure = 'is not sure about comment in',
    seen = 'has seen a comment in'
}

export enum ReplyTypes {
    accepted = 1,
    disagree = 2,
    clarification = 3,
    accepted_with_comment = 4,
    discarded = 5
}

export enum StatusIcon {
    pending = 'pending',
    complete = 'in-progress',
    finalized = 'quality-assessed',
    autochecked = 'autochecked'
}

export enum StatusIconCRP {
    pending = 'pending',
    complete = 'quality-assessed',
}

export enum StatusNames {
    pending = 'Pending',
    finalized = 'Quality Assessed',
    complete = 'In progress',
    autochecked = 'Automatically Validated'
}

export enum StatusNamesCRP {
    pending = 'Pending',
    complete = 'Answered / No action needed',
}