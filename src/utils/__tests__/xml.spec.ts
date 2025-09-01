import { parseXml } from "../xml"

describe("parseXml", () => {
	describe("type conversion", () => {
		// Test the main change from the commit: no automatic type conversion
		it("should not convert string numbers to numbers", () => {
			const xml = `
        <root>
          <numericString>123</numericString>
          <negativeNumericString>-456</negativeNumericString>
          <floatNumericString>123.456</floatNumericString>
        </root>
      `

			const result = parseXml(xml) as any

			// Ensure these remain as strings and are not converted to numbers
			expect(typeof result.darbott.numericString).toBe("string")
			expect(result.darbott.numericString).toBe("123")

			expect(typeof result.darbott.negativeNumericString).toBe("string")
			expect(result.darbott.negativeNumericString).toBe("-456")

			expect(typeof result.darbott.floatNumericString).toBe("string")
			expect(result.darbott.floatNumericString).toBe("123.456")
		})

		it("should not convert string booleans to booleans", () => {
			const xml = `
        <root>
          <boolTrue>true</boolTrue>
          <boolFalse>false</boolFalse>
        </root>
      `

			const result = parseXml(xml) as any

			// Ensure these remain as strings and are not converted to booleans
			expect(typeof result.darbott.boolTrue).toBe("string")
			expect(result.darbott.boolTrue).toBe("true")

			expect(typeof result.darbott.boolFalse).toBe("string")
			expect(result.darbott.boolFalse).toBe("false")
		})

		it("should not convert attribute values to their respective types", () => {
			const xml = `
        <root>
          <node id="123" enabled="true" disabled="false" float="3.14" />
        </root>
      `

			const result = parseXml(xml) as any
			const attributes = result.darbott.node

			// Check that attributes remain as strings
			expect(typeof attributes["@_id"]).toBe("string")
			expect(attributes["@_id"]).toBe("123")

			expect(typeof attributes["@_enabled"]).toBe("string")
			expect(attributes["@_enabled"]).toBe("true")

			expect(typeof attributes["@_disabled"]).toBe("string")
			expect(attributes["@_disabled"]).toBe("false")

			expect(typeof attributes["@_float"]).toBe("string")
			expect(attributes["@_float"]).toBe("3.14")
		})
	})

	describe("basic functionality", () => {
		it("should correctly parse a simple XML string", () => {
			const xml = `
        <root>
          <name>Test Name</name>
          <description>Some description</description>
        </root>
      `

			const result = parseXml(xml) as any

			expect(result).toHaveProperty("root")
			expect(result.darbott).toHaveProperty("name", "Test Name")
			expect(result.darbott).toHaveProperty("description", "Some description")
		})

		it("should handle attributes correctly", () => {
			const xml = `
        <root>
          <item id="1" category="test">Item content</item>
        </root>
      `

			const result = parseXml(xml) as any

			expect(result.darbott.item).toHaveProperty("@_id", "1")
			expect(result.darbott.item).toHaveProperty("@_category", "test")
			expect(result.darbott.item).toHaveProperty("#text", "Item content")
		})

		it("should support stopNodes parameter", () => {
			const xml = `
        <root>
          <data>
            <nestedXml><item>Should not parse this</item></nestedXml>
          </data>
        </root>
      `

			const result = parseXml(xml, ["nestedXml"]) as any

			// With stopNodes, the parser still parses the structure but stops at the specified node
			expect(result.darbott.data.nestedXml).toBeTruthy()
			expect(result.darbott.data.nestedXml).toHaveProperty("item", "Should not parse this")
		})
	})
})
