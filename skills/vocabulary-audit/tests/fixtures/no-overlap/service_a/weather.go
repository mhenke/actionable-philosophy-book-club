// Service A - Weather Data
package weather

type Temperature struct {
    Celsius    float64
    Fahrenheit float64
    Humidity   float64
}

func Forecast(location string) Temperature {
    return Temperature{
        Celsius:    22.5,
        Fahrenheit: 72.5,
        Humidity:   0.45,
    }
}

func ConvertWindSpeed(kph float64) float64 {
    return kph * 0.277778
}
