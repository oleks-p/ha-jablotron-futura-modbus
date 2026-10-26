"""Ukrainian entity names, as data rather than a hand-written JSON of 321 keys.

Two thirds of the names belong to repeating families -- eight CO2 sensors with
five readings each, eight ALFA panels with six, eight external sensors, eight
external buttons -- so they are composed from a template and a field glossary.
That is not laziness: it is the only way "CO2 sensor 3 temperature" and "CO2
sensor 7 temperature" are guaranteed to read the same way in Ukrainian.

The rest are spelled out one by one, because they are genuine terminology.

Four-duct vocabulary, which everything else hangs off. Futura names its four
flanges after what each carries, and Ukrainian has a distinct word for each, so
the distinction survives translation:

    outside / ambient   зовнішнє    drawn in from outdoors
    supply  / fresh     припливне   delivered to the rooms
    extract / indoor    витяжне     taken out of the rooms
    exhaust / waste     викидне     thrown back outdoors

English collapses the last two into "extract" and "exhaust", which read almost
alike; витяжне and викидне do not, which is an improvement on the original.

"Boost" is deliberately left untranslated. It is the name on the physical wall
buttons and in this house's own entity names (`button.boost_maister_sanvuzol`),
so translating it here would be the dashboard disagreeing with the hardware.
"""

from __future__ import annotations

import re

#: The repeating peripheral families: key prefix -> how the thing is named.
FAMILY_NOUNS: dict[str, str] = {
    "wall_ui": "Настінна панель",
    "wall_sensor": "Датчик CO2",
    "alfa": "ALFA",
    "ext_sensor": "Зовнішній датчик",
    "ext_button": "Зовнішня кнопка",
}

#: The field each family entity reports, as the tail of the name.
FAMILY_FIELDS: dict[str, str] = {
    "address": "адреса на шині",
    "options": "налаштування",
    "co2": "CO2",
    "temperature": "температура",
    "humidity": "вологість",
    "ntc_temperature": "температура NTC",
    "floor_temperature": "температура підлоги",
    "temp_correction": "корекція температури",
    "ntc_temp_correction": "корекція NTC",
    "present": "наявність",
    "active": "активна",
    "mode": "режим",
    "timer": "таймер",
    "invalid": "прапорці недійсності",
}

#: Everything that is not part of a family.
ONE_OFF: dict[str, str] = {
    # ── the four ducts ────────────────────────────────────────────────────
    "temp_ambient": "Температура зовнішнього повітря",
    "temp_fresh": "Температура припливного повітря",
    "temp_indoor": "Температура витяжного повітря",
    "temp_waste": "Температура викидного повітря",
    "humidity_ambient": "Вологість зовнішнього повітря",
    "humidity_fresh": "Вологість припливного повітря",
    "humidity_indoor": "Вологість витяжного повітря",
    "humidity_waste": "Вологість викидного повітря",
    "temp_outdoor_ntc": "Температура зовні (NTC)",
    "temp_mean_indoor": "Температура в приміщенні",
    "humidity_mean_indoor": "Вологість у приміщенні",
    # ── fans and flow ─────────────────────────────────────────────────────
    "fan_pwm_supply": "Потужність припливного вентилятора",
    "fan_pwm_exhaust": "Потужність витяжного вентилятора",
    "fan_rpm_supply": "Оберти припливного вентилятора",
    "fan_rpm_exhaust": "Оберти витяжного вентилятора",
    "air_flow": "Витрата повітря",
    "air_quality": "Якість повітря",
    "co2_max": "Найвищий CO2",
    # ── energy ────────────────────────────────────────────────────────────
    "power_consumption": "Споживана потужність",
    "heat_recovered": "Рекуперовано тепла",
    "heating_power": "Потужність донагрівача",
    "filter_wear": "Забруднення фільтра",
    "performance_factor": "Коефіцієнт ефективності",
    
    # ── modes and timers ──────────────────────────────────────────────────
    "ventilation": "Рівень вентиляції",
    "ventilation_text": "Режим вентиляції",
    "boost_timer": "Boost: залишилось",
    "circulation_timer": "Циркуляція: залишилось",
    "overpressure_timer": "Надлишковий тиск: залишилось",
    "night_timer": "Нічний режим: залишилось",
    "party_timer": "Режим «Вечірка»: залишилось",
    "away_begin_at": "Початок відпустки",
    "away_end_at": "Кінець відпустки",
    "temperature_setpoint": "Цільова температура",
    # ── VarioBreeze ───────────────────────────────────────────────────────
    "kitchenhood_volume": "Витрата кухонної витяжки",
    "kitchenhood_normally_open": "Кухонна витяжка: нормально розімкнений",
    "zone_boost_volume": "Витрата Boost зони",
    "valve_count_supply": "Клапани припливу",
    "valve_count_exhaust": "Клапани витяжки",
    # ── switches ──────────────────────────────────────────────────────────
    "time_program": "Розклад",
    "antiradon": "Захист від радону",
    "bypass_enable": "Автоматичний байпас",
    "heating_enable": "Додатковий нагрів",
    "cooling_enable": "Додаткове охолодження",
    "comfort_enable": "Керування комфортною температурою",
    # ── buttons ───────────────────────────────────────────────────────────
    "boost_30": "Boost 30 хвилин",
    "boost_60": "Boost 60 хвилин",
    "circulation_30": "Циркуляція 30 хвилин",
    "circulation_60": "Циркуляція 60 хвилин",
    "overpressure_15": "Надлишковий тиск 15 хвилин",
    "party_4h": "Вечірка 4 години",
    "night_8h": "Нічний режим 8 годин",
    "stop_all": "Зупинити всі функції",
    # ── counts and identity ───────────────────────────────────────────────
    "boost_button_count": "Кнопки Boost",
    "external_sensor_count": "Зовнішні датчики",
    "external_button_count": "Зовнішні кнопки",
    "connected_coolbreeze": "CoolBreeze підключено",
    "device_id": "Ідентифікатор пристрою",
    "serial_number": "Серійний номер",
    "mac_address": "MAC-адреса",
    "hw_revision": "Ревізія апаратної частини",
    "firmware": "Версія прошивки",
    "build_number": "Номер збірки",
    "regmap_version": "Версія карти регістрів",
    "variant": "Варіант моделі",
    "model": "Модель",
    # ── diagnostics ───────────────────────────────────────────────────────
    "rtc_battery_voltage": "Напруга батареї RTC",
    "uin1_voltage": "Напруга входу UIN1",
    "uin2_voltage": "Напруга входу UIN2",
    "stat_reads": "Читань Modbus",
    "stat_writes": "Записів Modbus",
    "stat_fails": "Збоїв Modbus",
    # ── aggregates ────────────────────────────────────────────────────────
    "any_error": "Несправність",
    "any_warning": "Попередження",
}

#: `fut_mode` bits. Named as the state itself rather than "X active": a binary
#: sensor already says on or off, so "Boost активний" would say it twice.
MODE: dict[str, str] = {
    "boost_active": "Boost",
    "circulation_active": "Циркуляція",
    "time_program_active": "Розклад",
    "overpressure_active": "Надлишковий тиск",
    "away_active": "Відпустка",
    "party_active": "Вечірка",
    "night_active": "Нічний режим",
    "antiradon_active": "Захист від радону",
    "antifreeze_active": "Захист від замерзання",
    "device_on": "Пристрій увімкнено",
    "filter_check_running": "Перевірка фільтра",
    "drying_running": "Осушення",
    "bypass_open": "Байпас відкритий",
    "low_outdoor_temp_limit": "Обмеження за низької зовнішньої температури",
    "stopped_after_error": "Зупинено через помилку",
    "starting_up": "Запуск",
    "service_mode": "Сервісний режим",
    "waste_air_below_minus_three": "Викидне повітря нижче −3 °C",
    "emergency_stop": "Аварійна зупинка",
    "pressure_loss_measurement": "Вимірювання втрат тиску",
    "standby": "Очікування",
    "zone_boost": "Boost зони",
    "zone_pressure_loss_measurement": "Вимірювання втрат тиску зон",
}

#: `fut_error` bits, read after "Помилка: ".
ERROR: dict[str, str] = {
    "sensor_ambient": "датчик зовнішнього повітря",
    "sensor_indoor": "датчик витяжного повітря",
    "sensor_fresh": "датчик припливного повітря",
    "sensor_waste": "датчик викидного повітря",
    "fan_supply": "припливний вентилятор",
    "fan_exhaust": "витяжний вентилятор",
    "fan_supply_blocked": "припливний вентилятор заблоковано",
    "fan_exhaust_blocked": "витяжний вентилятор заблоковано",
    "exchanger_communication": "звʼязок з рекуператором",
    "exchanger_damper_position": "положення заслінки рекуператора",
    "io_board_communication": "звʼязок із платою вводу/виводу",
    "coolbreeze_communication": "звʼязок із CoolBreeze",
    "coolbreeze_outdoor_unit": "зовнішній блок CoolBreeze",
}

#: `fut_warning` bits, read after "Попередження: ".
WARNING: dict[str, str] = {
    "filter_uninitialised": "фільтр не ініціалізовано",
    "filter_too_dirty": "фільтр надто забруднений",
    "filter_used_too_long": "фільтр використовується надто довго",
    "rtc_battery_low": "низький заряд батареї RTC",
    "fan_supply_overspeed": "перевищення обертів припливного вентилятора",
    "fan_exhaust_overspeed": "перевищення обертів витяжного вентилятора",
    "outdoor_temp_too_low": "надто низька зовнішня температура",
    "zone_config_supply": "конфігурація зон припливу",
    "zone_config_exhaust": "конфігурація зон витяжки",
    "emergency_stop": "аварійна зупинка",
    "superbreeze_communication": "звʼязок із SuperBreeze",
    "superbreeze_general": "загальна несправність SuperBreeze",
}

#: `fut_config` capability bits, read after "Підтримка: ".
CONFIG: dict[str, str] = {
    "internal_heating": "внутрішній нагрів",
    "coolbreeze_cooling": "охолодження CoolBreeze",
    "coolbreeze_heating": "нагрів CoolBreeze",
    "bypass": "байпас",
    "variobreeze": "VarioBreeze",
    "inner_circulation": "внутрішня циркуляція",
    "coolbreeze": "CoolBreeze",
    "exchanger_control": "керування рекуператором",
}

#: `dig_inputs` bits, read after "Вхід: ".
INPUT: dict[str, str] = {
    "user_button": "користувацька кнопка",
    "factory_button": "заводська кнопка",
    "boost_input": "Boost",
    "uin1": "UIN1",
    "uin2": "UIN2",
}

_BITS: dict[str, tuple[str, dict[str, str]]] = {
    "mode_": ("", MODE),
    "error_": ("Помилка: ", ERROR),
    "warning_": ("Попередження: ", WARNING),
    "config_": ("Підтримка: ", CONFIG),
    "input_": ("Вхід: ", INPUT),
}

_FAMILY = re.compile(
    r"^(" + "|".join(FAMILY_NOUNS) + r")_(\d+)_(.+)$"
)


def name(key: str) -> str | None:
    """The Ukrainian name for a translation key, or None if it has none.

    Returning None rather than guessing is the point: the test turns a None into
    a build failure naming the key, so a new entity cannot quietly ship with an
    English name in a Ukrainian install.
    """
    if key in ONE_OFF:
        return ONE_OFF[key]

    for prefix, (lead, table) in _BITS.items():
        if key.startswith(prefix):
            bit = key[len(prefix):]
            if bit in table:
                return f"{lead}{table[bit]}"
            return None

    if found := _FAMILY.match(key):
        noun, slot, field = found.groups()
        if field in FAMILY_FIELDS:
            return f"{FAMILY_NOUNS[noun]} {slot} — {FAMILY_FIELDS[field]}"
        return None

    return None
