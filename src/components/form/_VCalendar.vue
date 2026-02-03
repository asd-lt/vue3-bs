<script setup>
import { computed, ref } from 'vue';

const emit = defineEmits([
    'selected',
]);

const props = defineProps({
    date: {
        type: [String],
        default: '',
    },
});

const selectedDate = ref(props.date ? new Date(props.date) : new Date());

const showingDate = ref(selectedDate.value);

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear()
        && date1.getMonth() === date2.getMonth()
        && date1.getDate() === date2.getDate();
}

function generateWeeks(dateSelected = null, dateToShow = null) {
    let selectDateValue = new Date();
    let dateToShowValue = new Date();

    if (dateSelected) {
        selectDateValue = dateSelected;
    }

    if (dateToShow) {
        dateToShowValue = dateToShow;
    }

    const startDate = new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1);

    startDate.setDate(-((startDate.getDay() ? startDate.getDay() : 7) - 2));

    const weeksArr = [];
    do {
        const week = [];
        for (let i = 0; i < 7; i++) {
            week.push({
                value: startDate.getDate().toString(),
                date: new Date(startDate),
                this_month: startDate.getFullYear() === dateToShowValue.getFullYear() && startDate.getMonth() === dateToShowValue.getMonth(),
                this_day: isSameDay(startDate, selectDateValue),
            });
            startDate.setDate(startDate.getDate() + 1);
        }
        weeksArr.push(week);
    } while (startDate.getMonth() === dateToShowValue.getMonth());

    return weeksArr;
}

const weeks = computed(() => {
    return generateWeeks(selectedDate.value, showingDate.value);
});

function prevMonth() {
    const date = new Date(showingDate.value);
    date.setMonth(date.getMonth() - 1);
    showingDate.value = date;
}

function nextMonth() {
    const date = new Date(showingDate.value);
    date.setMonth(date.getMonth() + 1);
    showingDate.value = date;
}

function selectDate(date) {
    selectedDate.value = date;
    emit('selected', date);
}

</script>
<template>
    <table class="calendar">
        <thead>
            <tr>
                <th
                    class="prev-month"
                    @click="prevMonth()"
                >
                    &#x25C0;
                </th>
                <th colspan="5">
                    {{ showingDate.getFullYear() }} - {{ ('0' + (showingDate.getMonth() + 1)).slice(-2) }}
                </th>
                <th
                    class="next-month"
                    @click="nextMonth()"
                >
                    &#x25B6;
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="(week, weekIndex) of weeks"
                :key="'week-' + weekIndex"
            >
                <td
                    v-for="(day, dayIndex) of week"
                    :key="'day-' + dayIndex"
                    :class="{ 'this-day': day.this_day, 'this-month': day.this_month }"
                    @click="selectDate(day.date)"
                >
                    {{ day.value }}
                </td>
            </tr>
        </tbody>
    </table>
</template>
<style lang="scss" scoped>
.calendar {
    background-color: #ffffff;
    min-width: 200px;
    width: 100%;

    td, th {
        text-align: center;
        width: 30px;
        height: 30px;
        position: relative;
        z-index: 1;
    }

    th {
        z-index: 2;
    }

    td.this-day {
        font-weight: bold;
        text-decoration: underline;
    }

    th.prev-month:hover,
    th.next-month:hover,
    td:hover {
        cursor: pointer;
    }

    td:not(.this-month):not(:hover) {
        color: #cdcdcd;
    }

    th.prev-month:hover:before,
    th.next-month:hover:before,
    td:hover:before {
        content: '';
        background-color: #cdcdcd;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: -1;
        border-radius: 3px;
    }

    thead tr {
        position: relative;
        z-index: 2;
    }

    tbody {
        font-size: 12px;
    }
}

</style>
