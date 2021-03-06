export interface IsEmptyOperator {
    type: 'is-empty';
    value: any;
}

export interface IsNotEmptyOperator {
    type: 'is-not-empty';
    value: any;
}

export interface StringEqualsOperator {
    type: 'string-equals';
    value: string;
}

export interface StringNotEqualsOperator {
    type: 'string-not-equals';
    value: string;
}

export interface StringContainsOperator {
    type: 'string-contains';
    value: string;
}

export type StringOperators = StringEqualsOperator | StringNotEqualsOperator | StringContainsOperator | IsEmptyOperator | IsNotEmptyOperator;

export function isStringOperators(object: Operator): object is StringOperators {
    return object.type === 'string-equals' || object.type === 'string-not-equals' || object.type === 'string-contains' || object.type === 'is-empty' || object.type === 'is-not-empty';
}

export interface NumberEqualsOperator {
    type: 'number-equals';
    value: number;
}

export interface NumberNotEqualsOperator {
    type: 'number-not-equals';
    value: number;
}

export interface NumberSmallerThanOperator {
    type: 'number-smaller-than';
    value: number;
}

export interface NumberGreaterThanOperator {
    type: 'number-greater-than';
    value: number;
}

export type NumberOperators = NumberEqualsOperator | NumberNotEqualsOperator | NumberSmallerThanOperator | NumberGreaterThanOperator | IsEmptyOperator | IsNotEmptyOperator;

export function isNumberOperators(object: Operator): object is NumberOperators {
    return object.type === 'number-equals' || object.type === 'number-not-equals' || object.type === 'number-smaller-than' || object.type === 'number-greater-than' || object.type === 'is-empty' || object.type === 'is-not-empty';
}

export interface DateEqualsOperator {
    type: 'date-equals';
    value: number;
}

export interface DateNotEqualsOperator {
    type: 'date-not-equals';
    value: number;
}

export interface DateBeforeOperator {
    type: 'date-before';
    value: number;
}

export interface DateAfterOperator {
    type: 'date-after';
    value: number;
}

export interface DateEmptyOrBeforeOperator {
    type: 'date-empty-or-before';
    value: number;
}

export interface DateEmptyOrAfterOperator {
    type: 'date-empty-or-after';
    value: number;
}

export type DateOperators = DateEqualsOperator | DateNotEqualsOperator | DateBeforeOperator | DateAfterOperator | IsEmptyOperator | IsNotEmptyOperator | DateEmptyOrBeforeOperator | DateEmptyOrAfterOperator;

export function isDateOperators(object: Operator): object is DateOperators {
    return object.type === 'date-equals' || object.type === 'date-not-equals' || object.type === 'date-before' || object.type === 'date-after' || object.type === 'is-empty' || object.type === 'is-not-empty' || object.type === 'date-empty-or-before' || object.type === 'date-empty-or-after';
}

export interface BooleanEqualsOperator {
    type: 'boolean-equals';
    value: boolean;
}

export interface BooleanNotEqualsOperator {
    type: 'boolean-not-equals';
    value: boolean;
}

export type BooleanOperators = BooleanEqualsOperator | BooleanNotEqualsOperator | IsEmptyOperator | IsNotEmptyOperator;

export function isBooleanOperators(object: Operator): object is BooleanOperators {
    return object.type === 'boolean-equals' || object.type === 'boolean-not-equals' || object.type === 'is-empty' || object.type === 'is-not-empty';
}

export type Operator = StringOperators | NumberOperators | DateOperators | BooleanOperators;

export type FieldType = 'string' | 'boolean' | 'number' | 'date';

export interface Field<D> {
    type: FieldType;
    label: string;
    apply: (operator: Operator, data: D[]) => D[];
}

export interface Fields<D> {
    [Key: string]: Field<D>;
}

export interface Filter {
    id: string;
    operator: Operator;
}

export interface Filters {
    [Key: string]: Filter;
}
