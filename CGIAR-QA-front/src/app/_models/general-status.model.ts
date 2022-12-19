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
    qa_policies = 'Policies',
    qa_innovations = 'Innovations',
    qa_publications= 'Peer Reviewed Papers',
    qa_oicr= 'OICRs',
    qa_melia= 'MELIAs',
    qa_capdev_old= 'CapDevs-Old',
    qa_milestones= 'Milestones',
    qa_slo= 'SLOs',
    qa_aiccra_indicators_contrib = 'AICCRA Indicators Contrib',
    qa_knowledge_product = 'Knowledge Product',
    qa_capdev = 'CapDev',
    // qa_outcomes= 'Outcomes',
}

export enum IndicatorsID {
    innovations = 1,
    policies = 2,
    publications= 3,
    oicr= 4,
    melia= 5,
    capdev_old= 6,
    milestones= 7,
    slo= 8,
    knowledge_product = 10,
    capdev = 11
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